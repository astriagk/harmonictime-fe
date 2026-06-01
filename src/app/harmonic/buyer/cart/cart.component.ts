import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserService } from '@shared/services/user.service';
import { CartService } from 'src/app/shared/services/cart.service';
import {
  selectCartItems,
  selectCartLoading,
} from 'src/app/store/selectors/cart.selectors';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  couponCode: string = '';
  shipCost: number = 0;
  userData: any = {};
  cartItems: any = [];
  isLoading = true; // Drives the cart loading skeleton

  constructor(
    public cartService: CartService,
    public userService: UserService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((state) => {
      if (state?.user?.data) {
        this.userData = state.user.data;
      }
    });
    this.store.select(selectCartItems).subscribe((state) => {
      if (state?.length) {
        this.cartItems = state;
      } else {
        this.cartItems = [];
      }
    });
    this.store
      .select(selectCartLoading)
      .subscribe((loading) => (this.isLoading = loading));
  }

  incrementQty(item: any) {
    const max = item.RemainingQuantity ?? Infinity;
    const current = item.Quantity || 1;
    if (current < max) this.cartService.updateCartItemQuantity(item, current + 1);
  }

  decrementQty(item: any) {
    const current = item.Quantity || 1;
    if (current > 1) this.cartService.updateCartItemQuantity(item, current - 1);
  }

  handleCouponSubmit() {
    if (this.couponCode) {
      this.couponCode = '';
    }
  }

  handleShippingCost(value: number | string) {
    if (value === 'free') {
      this.shipCost = 0;
    } else {
      this.shipCost = value as number;
    }
  }
}
