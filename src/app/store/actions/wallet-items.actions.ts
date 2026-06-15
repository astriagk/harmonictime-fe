import { createAction, props } from '@ngrx/store';

// Itemized sold products, optionally filtered by status (''=all). The effect
// re-fetches when `force`, when not yet loaded, or when the requested status
// differs from the cached one.
export const loadWalletItems = createAction(
  '[WalletItems] Load',
  props<{ status: string; force?: boolean }>()
);

export const loadWalletItemsSuccess = createAction(
  '[WalletItems] Load Success',
  props<{ items: any[]; status: string }>()
);

export const loadWalletItemsFailure = createAction(
  '[WalletItems] Load Failure',
  props<{ error: any }>()
);
