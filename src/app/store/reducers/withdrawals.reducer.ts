import { createReducer, on } from '@ngrx/store';
import {
  loadWithdrawals,
  loadWithdrawalsSuccess,
  loadWithdrawalsFailure,
} from '../actions/withdrawals.actions';

export interface WithdrawalsState {
  withdrawals: any[];
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: WithdrawalsState = {
  withdrawals: [],
  loaded: false,
  loading: false,
  error: null,
};

export const withdrawalsReducer = createReducer(
  initialState,

  on(loadWithdrawals, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadWithdrawalsSuccess, (state, { withdrawals }) => ({
    ...state,
    withdrawals,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadWithdrawalsFailure, (state, { error }) => ({
    ...state,
    withdrawals: [],
    loaded: false,
    loading: false,
    error,
  }))
);
