import { createReducer, on } from '@ngrx/store';
import {
  loadSellerProducts,
  loadSellerProductsSuccess,
  loadSellerProductsFailure,
} from '../actions/seller-products.actions';

export interface SellerProductsState {
  products: any[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: SellerProductsState = {
  products: [],
  loaded: false,
  loading: false,
  error: null,
};

export const sellerProductsReducer = createReducer(
  initialState,

  on(loadSellerProducts, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadSellerProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadSellerProductsFailure, (state, { error }) => ({
    ...state,
    loaded: false,
    loading: false,
    error,
  }))
);
