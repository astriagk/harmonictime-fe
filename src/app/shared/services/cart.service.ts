import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from '../types/product-d-t';
import { UserService } from './user.service';
import {
  ADD_TO_CART,
  DELETE_CART_ITEM,
  ORDER_CHARGES,
  UPDATE_CART,
  USER_CART,
  roundMoney,
  withPlatformMarkup,
} from '@config/index';
import { GenericService } from './generic.service';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCartItems } from 'src/app/store/selectors/cart.selectors';
import {
  loadCart,
  patchCartItemQty,
  updateCart,
} from 'src/app/store/actions/cart.actions';
import { Router } from '@angular/router';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

const state = {
  cart_products: JSON.parse(localStorage['cart_products'] || '[]'),
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public orderQuantity: number = 1;
  public isCartOpen: boolean = false;
  cart$: Observable<any[]> = this.store.select(selectCartItems);

  constructor(
    private toastrService: ToastrService,
    private userService: UserService,
    private genericService: GenericService,
    private store: Store,
    private router: Router,
  ) {}

  handleOpenCartSidebar() {
    this.isCartOpen = !this.isCartOpen;
  }

  // add_cart_product
  addCartProduct(payload: any, quantity: number = 1) {
    this.store
      .select(selectUserData)
      .pipe(
        take(1),
        switchMap((state) => {
          const data = state?.user?.data;

          if (data) {
            const url = USER_CART + `${data._id}/${payload._id}`;
            return this.genericService.getObservable(url).pipe(
              tap(() =>
                this.toastrService.warning(
                  `${payload.ProductName} exists in the cart`,
                ),
              ),
              catchError(() => {
                const cartPayload = {
                  UserID: data._id,
                  ProductID: payload._id,
                  Quantity: quantity,
                };
                return this.genericService
                  .postObservable(ADD_TO_CART, cartPayload)
                  .pipe(
                    tap(() => {
                      this.toastrService.success(
                        `${payload.ProductName} added to cart`,
                      );
                      this.store.dispatch(loadCart({ force: true }));
                    }),
                  );
              }),
            );
          } else {
            this.addGuestCartProduct(payload, quantity);
            return EMPTY;
          }
        }),
      )
      .subscribe({
        error: (err) => {
          const message =
            err?.error?.message || 'Something went wrong. Please try again.';
          this.toastrService.error(message);
        },
      });
  }

  updateCartItemQuantity(cartItem: any, newQty: number) {
    const previousQty = cartItem.Quantity || 1;
    // Optimistic: update the store instantly so the UI responds without a reload
    this.store.dispatch(
      patchCartItemQty({ cartItemId: cartItem._id, quantity: newQty }),
    );
    this.genericService
      .putObservable(`${UPDATE_CART}${cartItem._id}`, { Quantity: newQty })
      .subscribe({
        next: () => {},
        error: (err) => {
          // Revert the optimistic update if the server rejects it
          this.store.dispatch(
            patchCartItemQty({
              cartItemId: cartItem._id,
              quantity: previousQty,
            }),
          );
          const message = err?.error?.message || 'Failed to update quantity.';
          this.toastrService.error(message);
        },
      });
  }

  // total price quantity
  public totalPriceQuantity() {
    return state.cart_products.reduce(
      (cartTotal: { total: number; quantity: number }, cartItem: any) => {
        const { Price, orderQuantity, discount } = cartItem;
        if (typeof orderQuantity !== 'undefined') {
          if (discount && discount > 0) {
            // Calculate the item total with discount
            const itemTotal =
              (Price - (Price * discount) / 100) * orderQuantity;
            cartTotal.total += itemTotal;
          } else {
            // Calculate the item total without discount
            const itemTotal = Price * orderQuantity;
            cartTotal.total += itemTotal;
          }
          cartTotal.quantity += orderQuantity;
        }
        return cartTotal;
      },
      {
        total: 0,
        quantity: 0,
      },
    );
  }

  computeCartTotal(cartItems: any) {
    return cartItems.reduce(
      (cartTotal: { total: number; quantity: number }, cartItem: any) => {
        const base = cartItem.DisplayPrice;
        const offer = cartItem.Offer;
        const qty = cartItem.Quantity || 1;
        // Round the per-unit price to paise first, then multiply, so each line
        // total the buyer sees adds up exactly to this subtotal (round-then-sum).
        const price =
          offer?.IsActive && base
            ? roundMoney(base * (1 - offer.DiscountPercentage / 100))
            : base;
        if (price) {
          cartTotal.total = roundMoney(cartTotal.total + price * qty);
          cartTotal.quantity += qty;
        }
        return cartTotal;
      },
      { total: 0, quantity: 0 },
    );
  }

  // Savings = DisplayPrice minus offer price, multiplied by quantity
  computeOfferDiscount(cartItems: any): number {
    return cartItems.reduce((savings: number, cartItem: any) => {
      const { DisplayPrice, Offer, Quantity } = cartItem;
      const qty = Quantity || 1;
      if (DisplayPrice && Offer?.IsActive) {
        const offerPrice = roundMoney(
          DisplayPrice * (1 - Offer.DiscountPercentage / 100),
        );
        savings = roundMoney(savings + (DisplayPrice - offerPrice) * qty);
      }
      return savings;
    }, 0);
  }

  // Subtotal (offer discount already applied, platform fee baked in) + GST + additional charges.
  // GST is only applied to items where IsPriceInclusiveOfTax is false.
  computeCheckoutSummary(cartItems: any) {
    const subtotal = this.computeCartTotal(cartItems).total;
    const offerDiscount = this.computeOfferDiscount(cartItems);
    const taxableSubtotal = (cartItems as any[]).reduce(
      (total: number, cartItem: any) => {
        if (cartItem.IsPriceInclusiveOfTax) return total;
        const base = cartItem.DisplayPrice;
        const offer = cartItem.Offer;
        const qty = cartItem.Quantity || 1;
        const price =
          offer?.IsActive && base
            ? roundMoney(base * (1 - offer.DiscountPercentage / 100))
            : base;
        return roundMoney(total + (price || 0) * qty);
      },
      0,
    );
    const gst = roundMoney((taxableSubtotal * ORDER_CHARGES.gstPercent) / 100);
    const gstPercent = ORDER_CHARGES.gstPercent;
    const grandTotal = roundMoney(subtotal + gst);
    return { subtotal, offerDiscount, gst, gstPercent, grandTotal };
  }

  // quantity increment
  increment() {
    return (this.orderQuantity = this.orderQuantity + 1);
  }

  // quantity decrement
  decrement() {
    return (this.orderQuantity =
      this.orderQuantity > 1
        ? this.orderQuantity - 1
        : (this.orderQuantity = 1));
  }

  // quantityDecrement
  quantityDecrement(payload: IProduct) {
    state.cart_products.map((item: IProduct) => {
      if (item.id === payload.id) {
        if (typeof item.orderQuantity !== 'undefined') {
          if (item.orderQuantity > 1) {
            item.orderQuantity = item.orderQuantity - 1;
            this.toastrService.info(`Decrement Quantity For ${item.title}`);
          }
        }
      }
      return { ...item };
    });
    localStorage.setItem('cart_products', JSON.stringify(state.cart_products));
  }

  // remover_cart_products
  removeCartProduct(payload: any) {
    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((state: any) => {
        const user = state?.user?.data;
        if (user) {
          // Logged-in user: delete the cart row on the server (payload._id is the cart row id)
          if (payload._id) {
            const url = DELETE_CART_ITEM + `${payload._id}`;
            this.genericService.deleteObservable(url).subscribe({
              next: () => {
                this.toastrService.success(
                  `${payload.ProductName} removed from cart`,
                );
                this.store.dispatch(loadCart({ force: true }));
              },
              error: () => {
                this.toastrService.error(
                  `${payload.ProductName} error removing from cart`,
                );
              },
            });
          }
        } else {
          // Guest user: remove from the session-storage cart
          this.removeGuestCartProduct(payload);
        }
      });
  }

  // ----- Guest cart (session storage) -----
  private readonly GUEST_CART_KEY = 'guest_cart';

  private getGuestCart(): any[] {
    return JSON.parse(sessionStorage.getItem(this.GUEST_CART_KEY) || '[]');
  }

  private saveGuestCart(cart: any[]) {
    sessionStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(cart));
    this.store.dispatch(updateCart({ cart }));
  }

  // Hydrate the store from session storage on app start (guest users)
  loadGuestCart() {
    this.store.dispatch(updateCart({ cart: this.getGuestCart() }));
  }

  private addGuestCartProduct(payload: any, quantity: number = 1) {
    const guestCart = this.getGuestCart();
    const exists = guestCart.some((p: any) => p.ProductID === payload._id);
    if (exists) {
      this.toastrService.warning(`${payload.ProductName} exists in the cart`);
      return;
    }
    const item = { ...payload, ProductID: payload._id, Quantity: quantity };
    this.saveGuestCart([...guestCart, item]);
    this.toastrService.success(`${payload.ProductName} added to cart`);
  }

  private removeGuestCartProduct(payload: any) {
    const guestCart = this.getGuestCart().filter(
      (p: any) => p.ProductID !== payload._id && p._id !== payload._id,
    );
    this.saveGuestCart(guestCart);
    this.toastrService.success(`${payload.ProductName} removed from cart`);
  }

  // On login, push any guest cart items to the server, clear session, reload cart
  mergeGuestCart(userId: string) {
    const guestCart = this.getGuestCart();
    if (!guestCart.length) {
      this.store.dispatch(loadCart({}));
      return;
    }
    const requests = guestCart.map((item: any) =>
      this.genericService
        .postObservable(ADD_TO_CART, {
          UserID: userId,
          ProductID: item.ProductID || item._id,
          Quantity: item.Quantity || 1,
        })
        .pipe(catchError(() => of(null))),
    );
    forkJoin(requests).subscribe(() => {
      sessionStorage.removeItem(this.GUEST_CART_KEY);
      this.store.dispatch(loadCart({ force: true }));
    });
  }

  // clear cart
  clear_cart() {
    const confirmMsg = window.confirm(
      'Are you sure deleted your all cart items ?',
    );
    if (confirmMsg) {
      state.cart_products = [];
    }
    localStorage.setItem('cart_products', JSON.stringify(state.cart_products));
  }
  // initialOrderQuantity
  initialOrderQuantity() {
    return (this.orderQuantity = 1);
  }
}
