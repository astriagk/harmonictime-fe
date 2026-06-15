import { createAction, props } from '@ngrx/store';

// Admin withdrawal queue, filtered by status ('All' = no filter). The effect
// re-fetches when forced, not loaded, or the status filter changed.
export const loadAdminWithdrawals = createAction(
  '[AdminWithdrawals] Load',
  props<{ status: string; force?: boolean }>()
);

export const loadAdminWithdrawalsSuccess = createAction(
  '[AdminWithdrawals] Load Success',
  props<{ withdrawals: any[]; status: string }>()
);

export const loadAdminWithdrawalsFailure = createAction(
  '[AdminWithdrawals] Load Failure',
  props<{ error: any }>()
);
