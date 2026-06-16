import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminProductsState } from '../reducers/admin-products.reducer';

export const selectAdminProductsState =
  createFeatureSelector<AdminProductsState>('adminProducts');

export const selectAdminProducts = createSelector(
  selectAdminProductsState,
  (state) => state.products
);

export const selectAdminProductsLoading = createSelector(
  selectAdminProductsState,
  (state) => state.loading
);
