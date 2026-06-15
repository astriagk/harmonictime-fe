import { createAction, props } from '@ngrx/store';

// All users (admin view). Filtering into customers/sellers is done client-side.
// `force: true` bypasses the loaded-cache guard (used after admin mutations).
export const loadAdminUsers = createAction(
  '[AdminUsers] Load',
  props<{ force?: boolean }>()
);

export const loadAdminUsersSuccess = createAction(
  '[AdminUsers] Load Success',
  props<{ users: any[] }>()
);

export const loadAdminUsersFailure = createAction(
  '[AdminUsers] Load Failure',
  props<{ error: any }>()
);
