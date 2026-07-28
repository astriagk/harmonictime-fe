import { createAction, props } from '@ngrx/store';

export const registerUser = createAction(
  '[User] Register',
  props<{ url: string; payload: { email: string; password: number } }>()
);
export const registerUserSuccess = createAction(
  '[User] Register Success',
  props<{ data: string[] }>()
);
export const registerUserFailure = createAction(
  '[User] Register Failure',
  props<{ error: string }>()
);

// One action for every credential exchange that ends in a session. `url` picks
// the endpoint: LOGIN_USER takes email/password, GOOGLE_LOGIN takes a Google ID
// token. Both responses carry the same session payload, so the effects and the
// downstream navigation are shared.
export type LoginCredentials =
  | { email: string; password: string }
  | { idToken: string };

export const loginUser = createAction(
  '[User] Login',
  props<{ url: string; payload: LoginCredentials }>()
);
export const loginUserSuccess = createAction(
  '[User] Login Success',
  props<{ data: string[] | any }>()
);
export const loginUserFailure = createAction(
  '[User] Login Failure',
  props<{ error: string }>()
);

export const loadUser = createAction(
  '[User] Load User',
  props<{ skipNavigation?: boolean }>()
);
export const loadUserSuccess = createAction(
  '[User] Load User Success',
  props<{ user: any; skipNavigation?: boolean }>()
);
export const loadUserFailure = createAction(
  '[User] Load User Failure',
  props<{ error: any }>()
);

export const userBlocked = createAction(
  '[User] Account Blocked',
  props<{ suspended: boolean }>()
);

export const logout = createAction('[Auth] Logout');
