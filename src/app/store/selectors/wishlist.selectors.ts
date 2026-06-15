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

// Select Loading State
export const selectWishlistLoading = createSelector(
  selectWishlistState,
  (state) => state.loading
);

// Select Loaded flag (used by the effect's re-fetch guard)
export const selectWishlistLoaded = createSelector(
  selectWishlistState,
  (state) => state.loaded
);

export const isProductInWishlist = (productId: string) =>
  createSelector(selectWishlistItems, (wishlistItems) =>
    wishlistItems.some(
      (prd) => prd.ProductID === productId || prd._id === productId
    )
  );
