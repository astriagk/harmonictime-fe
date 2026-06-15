import { createAction, props } from '@ngrx/store';

// Load Orders
export const loadOrders = createAction(
  '[Orders] Load Orders',
  props<{ userId: string; force?: boolean }>()
);

// Load Orders Success
export const loadOrdersSuccess = createAction(
  '[Orders] Load Orders Success',
  props<{ orders: any[] }>()
);

// Load Orders Failure
export const loadOrdersFailure = createAction(
  '[Orders] Load Orders Failure',
  props<{ error: string }>()
);
