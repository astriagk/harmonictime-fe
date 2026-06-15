import { createReducer, on } from '@ngrx/store';
import {
  loadAdminWithdrawals,
  loadAdminWithdrawalsSuccess,
  loadAdminWithdrawalsFailure,
} from '../actions/admin-withdrawals.actions';

export interface AdminWithdrawalsState {
  withdrawals: any[];
  status: string; // the status filter the cached rows belong to
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: AdminWithdrawalsState = {
  withdrawals: [],
  status: 'All',
  loaded: false,
  loading: false,
  error: null,
};

export const adminWithdrawalsReducer = createReducer(
  initialState,

  on(loadAdminWithdrawals, (state, { status, force }) => ({
    ...state,
    loading: force || !state.loaded || status !== state.status,
    error: null,
  })),

  on(loadAdminWithdrawalsSuccess, (state, { withdrawals, status }) => ({
    ...state,
    withdrawals,
    status,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadAdminWithdrawalsFailure, (state, { error }) => ({
    ...state,
    withdrawals: [],
    loaded: false,
    loading: false,
    error,
  }))
);
