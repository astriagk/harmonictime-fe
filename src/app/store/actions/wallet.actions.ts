import { createAction, props } from '@ngrx/store';

// Wallet summary — seller identity comes from the JWT, so no userId is needed.
// `force: true` bypasses the loaded-cache guard (used after withdrawal mutations).
export const loadWallet = createAction(
  '[Wallet] Load',
  props<{ force?: boolean }>()
);

export const loadWalletSuccess = createAction(
  '[Wallet] Load Success',
  props<{ wallet: any }>()
);

export const loadWalletFailure = createAction(
  '[Wallet] Load Failure',
  props<{ error: any }>()
);
