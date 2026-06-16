import { createReducer, on } from '@ngrx/store';
import {
  loadSellerOffers,
  loadSellerOffersSuccess,
  loadSellerOffersFailure,
} from '../actions/seller-offers.actions';

export interface SellerOffersState {
  offers: any[];
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: SellerOffersState = {
  offers: [],
  loaded: false,
  loading: false,
  error: null,
};

export const sellerOffersReducer = createReducer(
  initialState,

  on(loadSellerOffers, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadSellerOffersSuccess, (state, { offers }) => ({
    ...state,
    offers,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadSellerOffersFailure, (state, { error }) => ({
    ...state,
    offers: [],
    loaded: false,
    loading: false,
    error,
  }))
);
