import { createAction, props } from '@ngrx/store';

// Addresses are scoped to a user (userId in the URL). `force: true` bypasses the
// loaded-cache guard (used after add/edit/delete).
export const loadAddresses = createAction(
  '[Addresses] Load',
  props<{ userId: string; force?: boolean }>()
);

export const loadAddressesSuccess = createAction(
  '[Addresses] Load Success',
  props<{ addresses: any[] }>()
);

export const loadAddressesFailure = createAction(
  '[Addresses] Load Failure',
  props<{ error: any }>()
);
