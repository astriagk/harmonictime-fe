import { createAction, props } from '@ngrx/store';

export const loadSellerOrders = createAction('[SellerOrders] Load');

export const loadSellerOrdersSuccess = createAction(
  '[SellerOrders] Load Success',
  props<{ orders: any[] }>()
);

export const loadSellerOrdersFailure = createAction(
  '[SellerOrders] Load Failure',
  props<{ error: string }>()
);
