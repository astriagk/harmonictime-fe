import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WishlistState } from '../reducers/wishlist.reducer';

// Feature Selector
export const selectWishlistState =
  createFeatureSelector<WishlistState>('wishlist');

// Select Wishlist Items
export const selectWishlistItems = createSelector(
  selectWishlistState,
  (state) => state.wishlist
);

// Select Wishlist Error
export const selectWishlistError = createSelector(
  selectWishlistState,
  (state) => state.error
);

export const isProductInWishlist = (productId: string) =>
  createSelector(selectWishlistItems, (wishlistItems) =>
    wishlistItems.some(
      (prd) => prd.ProductID === productId || prd._id === productId
    )
  );
