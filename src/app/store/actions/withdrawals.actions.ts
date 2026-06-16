import { createAction, props } from '@ngrx/store';

// Seller payout history — identity from the JWT. `force: true` bypasses the
// loaded-cache guard (used after request/cancel withdrawal).
export const loadWithdrawals = createAction(
  '[Withdrawals] Load',
  props<{ force?: boolean }>()
);

export const loadWithdrawalsSuccess = createAction(
  '[Withdrawals] Load Success',
  props<{ withdrawals: any[] }>()
);

export const loadWithdrawalsFailure = createAction(
  '[Withdrawals] Load Failure',
  props<{ error: any }>()
);
