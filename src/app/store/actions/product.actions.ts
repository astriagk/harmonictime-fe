import { createAction, props } from '@ngrx/store';

export const loadProducts = createAction('[Products] Load Products');

export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: any[] }>()
);

export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
  props<{ error: string }>()
);

export const loadProductDetail = createAction(
  '[Products] Load Product Detail',
  props<{ id: string }>()
);

export const loadProductDetailSuccess = createAction(
  '[Products] Load Product Detail Success',
  props<{ product: any; id: string }>()
);

export const loadProductDetailFailure = createAction(
  '[Products] Load Product Detail Failure',
  props<{ error: string }>()
);

// Seller edit-form load: fetches a single product via the authenticated
// endpoint (returns the seller's own products incl. pending/unavailable).
// Always re-fetches so the form reflects the latest saved state.
export const loadEditProduct = createAction(
  '[Products] Load Edit Product',
  props<{ id: string }>()
);

export const loadEditProductSuccess = createAction(
  '[Products] Load Edit Product Success',
  props<{ product: any }>()
);

export const loadEditProductFailure = createAction(
  '[Products] Load Edit Product Failure',
  props<{ error: string }>()
);
