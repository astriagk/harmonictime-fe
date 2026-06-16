import { createReducer, on } from '@ngrx/store';
import {
  loadWallet,
  loadWalletSuccess,
  loadWalletFailure,
} from '../actions/wallet.actions';

export interface WalletState {
  wallet: any;
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: WalletState = {
  wallet: null,
  loaded: false,
  loading: false,
  error: null,
};

export const walletReducer = createReducer(
  initialState,

  on(loadWallet, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallet,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadWalletFailure, (state, { error }) => ({
    ...state,
    wallet: null,
    loaded: false,
    loading: false,
    error,
  }))
);
