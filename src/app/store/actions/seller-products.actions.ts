import { createAction, props } from '@ngrx/store';

export const loadSellerProducts = createAction(
  '[SellerProducts] Load',
  props<{ force?: boolean }>()
);

export const loadSellerProductsSuccess = createAction(
  '[SellerProducts] Load Success',
  props<{ products: any[] }>()
);

export const loadSellerProductsFailure = createAction(
  '[SellerProducts] Load Failure',
  props<{ error: string }>()
);
