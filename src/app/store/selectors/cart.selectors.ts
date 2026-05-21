import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from '../reducers/cart.reducer';

// Feature Selector
export const selectCartState = createFeatureSelector<CartState>('cart');

// Select Cart Items
export const selectCartItems = createSelector(
  selectCartState,
  (state) => state.cart
);

// Select Cart Error
export const selectCartError = createSelector(
  selectCartState,
  (state) => state.error
);

export const isProductInCart = (productId: string) =>
  createSelector(selectCartItems, (cartItems) =>
    cartItems.some((prd) => prd.ProductID === productId)
  );
