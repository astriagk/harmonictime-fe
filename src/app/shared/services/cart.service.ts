import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from '../types/product-d-t';
import { UserService } from './user.service';
import {
  ADD_TO_CART,
  DELETE_CART_ITEM,
  ORDER_CHARGES,
  USER_CART,
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
import { loadCart, updateCart } from 'src/app/store/actions/cart.actions';
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
    private router: Router
  ) {}

  handleOpenCartSidebar() {
    this.isCartOpen = !this.isCartOpen;
  }

  // add_cart_product
  addCartProduct(payload: any) {
    this.store
      .select(selectUserData)
      .pipe(
        take(1),
        switchMap((state) => {
          const data = state?.user?.data; // Extract user data from store

          if (data) {
            const url = USER_CART + `${data._id}/${payload._id}`;
            return this.genericService.getObservable(url).pipe(
              tap(() =>
                this.toastrService.warning(
                  `${payload.ProductName} exists in the cart`
                )
              ),
              catchError(() => {
                // If item is not found in the cart, add it
                const cartPayload = {
                  UserID: data._id,
                  ProductID: payload._id,
                };
                return this.genericService
                  .postObservable(ADD_TO_CART, cartPayload)
                  .pipe(
                    tap(() => {
                      this.toastrService.success(
                        `${payload.ProductName} added to cart`
                      );
                      this.store.dispatch(loadCart()); // Dispatch action to reload cart
                    })
                  );
              })
            );
          } else {
            // Guest user: keep the cart in session storage instead of forcing login
            this.addGuestCartProduct(payload);
            return EMPTY;
          }
        })
      )
      .subscribe({
        error: (err) => {
          // Surface the server's message (e.g. "Product already in cart")
          const message =
            err?.error?.message || 'Something went wrong. Please try again.';
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
      }
    );
  }

  computeCartTotal(cartItems: any) {
    return cartItems.reduce(
      (cartTotal: { total: number; quantity: number }, cartItem: any) => {
        const { Price } = cartItem;
        if (Price) {
          // Platform fee is baked into the price the buyer pays.
          cartTotal.total += withPlatformMarkup(Price);
        }
        return cartTotal;
      },
      { total: 0, quantity: 0 }
    );
  }

  // Subtotal (platform fee already baked into prices) + extra charges, plus the
  // grand total to pay. GST is computed but excluded from the total for now.
  computeCheckoutSummary(cartItems: any) {
    const subtotal = this.computeCartTotal(cartItems).total;
    const gst = (subtotal * ORDER_CHARGES.gstPercent) / 100;
    const extra = subtotal > 0 ? ORDER_CHARGES.extraFlat : 0;
    const charges = extra; // additional charges (GST excluded for now)
    const grandTotal = subtotal + charges;
    return { subtotal, gst, extra, charges, grandTotal };
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
                  `${payload.ProductName} removed from cart`
                );
                this.store.dispatch(loadCart());
              },
              error: () => {
                this.toastrService.error(
                  `${payload.ProductName} error removing from cart`
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

  private addGuestCartProduct(payload: any) {
    const guestCart = this.getGuestCart();
    const exists = guestCart.some((p: any) => p.ProductID === payload._id);
    if (exists) {
      this.toastrService.warning(`${payload.ProductName} exists in the cart`);
      return;
    }
    // Keep ProductID so isProductInCart() and the merge-on-login flow work
    const item = { ...payload, ProductID: payload._id };
    this.saveGuestCart([...guestCart, item]);
    this.toastrService.success(`${payload.ProductName} added to cart`);
  }

  private removeGuestCartProduct(payload: any) {
    const guestCart = this.getGuestCart().filter(
      (p: any) => p.ProductID !== payload._id && p._id !== payload._id
    );
    this.saveGuestCart(guestCart);
    this.toastrService.success(`${payload.ProductName} removed from cart`);
  }

  // On login, push any guest cart items to the server, clear session, reload cart
  mergeGuestCart(userId: string) {
    const guestCart = this.getGuestCart();
    if (!guestCart.length) {
      this.store.dispatch(loadCart());
      return;
    }
    const requests = guestCart.map((item: any) =>
      this.genericService
        .postObservable(ADD_TO_CART, {
          UserID: userId,
          ProductID: item.ProductID || item._id,
        })
        .pipe(catchError(() => of(null)))
    );
    forkJoin(requests).subscribe(() => {
      sessionStorage.removeItem(this.GUEST_CART_KEY);
      this.store.dispatch(loadCart());
    });
  }

  // clear cart
  clear_cart() {
    const confirmMsg = window.confirm(
      'Are you sure deleted your all cart items ?'
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
