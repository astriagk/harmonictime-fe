import { createReducer, on } from '@ngrx/store';
import {
  loadAddresses,
  loadAddressesSuccess,
  loadAddressesFailure,
} from '../actions/addresses.actions';

export interface AddressesState {
  addresses: any[];
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: AddressesState = {
  addresses: [],
  loaded: false,
  loading: false,
  error: null,
};

export const addressesReducer = createReducer(
  initialState,

  on(loadAddresses, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadAddressesSuccess, (state, { addresses }) => ({
    ...state,
    addresses,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadAddressesFailure, (state, { error }) => ({
    ...state,
    addresses: [],
    loaded: false,
    loading: false,
    error,
  }))
);
