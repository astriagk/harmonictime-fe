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

// Immutably replace a single order in the cached list (e.g. after approve/
// reject/add-tracking) without re-fetching the whole list.
export const upsertSellerOrder = createAction(
  '[SellerOrders] Upsert Order',
  props<{ order: any }>()
);
