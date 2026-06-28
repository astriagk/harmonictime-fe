import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from '../reducers/product.reducer';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectProducts = createSelector(
  selectProductsState,
  (state) => state.products
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  (state) => state.loading
);

export const selectProductsLoaded = createSelector(
  selectProductsState,
  (state) => state.loaded
);

export const selectProductsSearchQuery = createSelector(
  selectProductsState,
  (state) => state.searchQuery
);

export const selectProductsError = createSelector(
  selectProductsState,
  (state) => state.error
);

export const selectProductDetail = createSelector(
  selectProductsState,
  (state) => state.detailProduct
);

export const selectProductDetailLoading = createSelector(
  selectProductsState,
  (state) => state.detailLoading
);

export const selectProductDetailId = createSelector(
  selectProductsState,
  (state) => state.detailProductId
);

export const selectEditProduct = createSelector(
  selectProductsState,
  (state) => state.editProduct
);

export const selectEditProductLoading = createSelector(
  selectProductsState,
  (state) => state.editLoading
);
