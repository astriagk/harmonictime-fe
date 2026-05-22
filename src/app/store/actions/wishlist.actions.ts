import { createAction, props } from '@ngrx/store';

// Load Wishlist
export const loadWishlist = createAction('[Wishlist] Load Wishlist');

export const loadWishlistSuccess = createAction(
  '[Wishlist] Load Wishlist Success',
  props<{ wishlist: any[] }>()
);

export const loadWishlistFailure = createAction(
  '[Wishlist] Load Wishlist Failure',
  props<{ error: any }>()
);

// Update Wishlist (e.g., adding or removing items for guest users)
export const updateWishlist = createAction(
  '[Wishlist] Update Wishlist',
  props<{ wishlist: any[] }>()
);
