import { createAction, props } from '@ngrx/store';

// Payout bank accounts — identity from the JWT. `force: true` bypasses the
// loaded-cache guard (used after add/edit/delete/verify).
export const loadBankAccounts = createAction(
  '[BankAccounts] Load',
  props<{ force?: boolean }>()
);

export const loadBankAccountsSuccess = createAction(
  '[BankAccounts] Load Success',
  props<{ bankAccounts: any[] }>()
);

export const loadBankAccountsFailure = createAction(
  '[BankAccounts] Load Failure',
  props<{ error: any }>()
);
