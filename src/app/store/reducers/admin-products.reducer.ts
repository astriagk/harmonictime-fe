import { createReducer, on } from '@ngrx/store';
import {
  loadAdminProducts,
  loadAdminProductsSuccess,
  loadAdminProductsFailure,
} from '../actions/admin-products.actions';

export interface AdminProductsState {
  products: any[];
  status: string; // the status filter the cached products belong to
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: AdminProductsState = {
  products: [],
  status: 'Pending',
  loaded: false,
  loading: false,
  error: null,
};

export const adminProductsReducer = createReducer(
  initialState,

  on(loadAdminProducts, (state, { status, force }) => ({
    ...state,
    loading: force || !state.loaded || status !== state.status,
    error: null,
  })),

  on(loadAdminProductsSuccess, (state, { products, status }) => ({
    ...state,
    products,
    status,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadAdminProductsFailure, (state, { error }) => ({
    ...state,
    products: [],
    loaded: false,
    loading: false,
    error,
  }))
);
