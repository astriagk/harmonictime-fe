import { createAction, props } from '@ngrx/store';

// Admin product list, filtered by approval status ('all' = no filter). The
// effect re-fetches when forced, not loaded, or the status filter changed.
export const loadAdminProducts = createAction(
  '[AdminProducts] Load',
  props<{ status: string; force?: boolean }>()
);

export const loadAdminProductsSuccess = createAction(
  '[AdminProducts] Load Success',
  props<{ products: any[]; status: string }>()
);

export const loadAdminProductsFailure = createAction(
  '[AdminProducts] Load Failure',
  props<{ error: any }>()
);
