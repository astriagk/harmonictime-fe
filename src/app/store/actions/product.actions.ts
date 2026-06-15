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
