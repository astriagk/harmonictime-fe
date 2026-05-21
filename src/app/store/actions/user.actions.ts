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

export const loginUser = createAction(
  '[User] Login',
  props<{ url: string; payload: { email: string; password: number } }>()
);
export const loginUserSuccess = createAction(
  '[User] Login Success',
  props<{ data: string[] | any }>()
);
export const loginUserFailure = createAction(
  '[User] Login Failure',
  props<{ error: string }>()
);

export const loadUser = createAction('[User] Load User');
export const loadUserSuccess = createAction(
  '[User] Load User Success',
  props<{ user: any }>()
);
export const loadUserFailure = createAction(
  '[User] Load User Failure',
  props<{ error: any }>()
);
