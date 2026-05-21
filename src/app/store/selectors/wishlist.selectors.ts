// --- app/store/wishlist/wishlist.selectors.ts ---
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WishlistState } from '../reducers/wishlist.reducer';

export const selectWishlistState =
  createFeatureSelector<WishlistState>('wishlist');

export const selectWishlistItems = createSelector(
  selectWishlistState,
  (state) => state.items
);
export const selectWishlistLoading = createSelector(
  selectWishlistState,
  (state) => state.loading
);
export const selectWishlistError = createSelector(
  selectWishlistState,
  (state) => state.error
);
