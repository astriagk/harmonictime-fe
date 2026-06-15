import { createReducer, on } from '@ngrx/store';
import {
  loadAdminUsers,
  loadAdminUsersSuccess,
  loadAdminUsersFailure,
} from '../actions/admin-users.actions';

export interface AdminUsersState {
  users: any[];
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: AdminUsersState = {
  users: [],
  loaded: false,
  loading: false,
  error: null,
};

export const adminUsersReducer = createReducer(
  initialState,

  on(loadAdminUsers, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadAdminUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadAdminUsersFailure, (state, { error }) => ({
    ...state,
    users: [],
    loaded: false,
    loading: false,
    error,
  }))
);
