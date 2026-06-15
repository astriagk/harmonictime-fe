import { createReducer, on } from '@ngrx/store';
import {
  loadWalletItems,
  loadWalletItemsSuccess,
  loadWalletItemsFailure,
} from '../actions/wallet-items.actions';

export interface WalletItemsState {
  items: any[];
  status: string; // the status filter the cached items belong to
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: WalletItemsState = {
  items: [],
  status: '',
  loaded: false,
  loading: false,
  error: null,
};

export const walletItemsReducer = createReducer(
  initialState,

  // Show loading whenever a real fetch will happen: forced, never loaded, or the
  // requested status differs from what's cached (mirrors the effect's guard).
  on(loadWalletItems, (state, { status, force }) => ({
    ...state,
    loading: force || !state.loaded || status !== state.status,
    error: null,
  })),

  on(loadWalletItemsSuccess, (state, { items, status }) => ({
    ...state,
    items,
    status,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadWalletItemsFailure, (state, { error }) => ({
    ...state,
    items: [],
    loaded: false,
    loading: false,
    error,
  }))
);
