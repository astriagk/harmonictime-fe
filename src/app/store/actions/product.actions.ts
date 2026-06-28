import { createAction, props } from '@ngrx/store';

export const loadProducts = createAction('[Products] Load Products');

// Full-text search. Results flow into the same `products` state via
// loadProductsSuccess so the shop listing renders them with no extra wiring.
export const searchProducts = createAction(
  '[Products] Search Products',
  props<{ query: string }>()
);

export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  // `query` tracks what the loaded list represents: a search term, or null for
  // the full catalog. Lets the reducer/effects know when a refetch is needed.
  props<{ products: any[]; query?: string | null }>()
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
