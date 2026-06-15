import { createReducer, on } from '@ngrx/store';
import {
  loadBankAccounts,
  loadBankAccountsSuccess,
  loadBankAccountsFailure,
} from '../actions/bank-accounts.actions';

export interface BankAccountsState {
  bankAccounts: any[];
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: BankAccountsState = {
  bankAccounts: [],
  loaded: false,
  loading: false,
  error: null,
};

export const bankAccountsReducer = createReducer(
  initialState,

  on(loadBankAccounts, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadBankAccountsSuccess, (state, { bankAccounts }) => ({
    ...state,
    bankAccounts,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadBankAccountsFailure, (state, { error }) => ({
    ...state,
    bankAccounts: [],
    loaded: false,
    loading: false,
    error,
  }))
);
