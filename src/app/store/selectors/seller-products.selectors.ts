import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SellerProductsState } from '../reducers/seller-products.reducer';

export const selectSellerProductsState = createFeatureSelector<SellerProductsState>('sellerProducts');

export const selectSellerProducts = createSelector(
  selectSellerProductsState,
  (state) => state.products
);

export const selectSellerProductsLoading = createSelector(
  selectSellerProductsState,
  (state) => state.loading
);

export const selectSellerProductsLoaded = createSelector(
  selectSellerProductsState,
  (state) => state.loaded
);
