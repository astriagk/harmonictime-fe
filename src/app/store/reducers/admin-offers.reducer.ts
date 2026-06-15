import { createReducer, on } from '@ngrx/store';
import {
  loadAdminOffers,
  reloadAdminOffers,
  loadAdminOffersSuccess,
  loadAdminOffersFailure,
} from '../actions/admin-offers.actions';

export interface AdminOffersState {
  offers: any[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: AdminOffersState = {
  offers: [],
  loaded: false,
  loading: false,
  error: null,
};

export const adminOffersReducer = createReducer(
  initialState,

  on(loadAdminOffers, (state) => ({
    ...state,
    loading: !state.loaded,
    error: null,
  })),

  on(reloadAdminOffers, (state) => ({
    ...state,
    loading: true,
    loaded: false,
    error: null,
  })),

  on(loadAdminOffersSuccess, (state, { offers }) => ({
    ...state,
    offers,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadAdminOffersFailure, (state, { error }) => ({
    ...state,
    loaded: false,
    loading: false,
    error,
  }))
);
