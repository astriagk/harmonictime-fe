import { createReducer, on } from '@ngrx/store';
import {
  loadSellerOrders,
  loadSellerOrdersSuccess,
  loadSellerOrdersFailure,
  upsertSellerOrder,
} from '../actions/seller-orders.actions';

export interface SellerOrdersState {
  orders: any[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: SellerOrdersState = {
  orders: [],
  loaded: false,
  loading: false,
  error: null,
};

export const sellerOrdersReducer = createReducer(
  initialState,

  on(loadSellerOrders, (state) => ({
    ...state,
    loading: !state.loaded,
    error: null,
  })),

  on(loadSellerOrdersSuccess, (state, { orders }) => ({
    ...state,
    orders,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadSellerOrdersFailure, (state, { error }) => ({
    ...state,
    loaded: false,
    loading: false,
    error,
  })),

  on(upsertSellerOrder, (state, { order }) => ({
    ...state,
    orders: state.orders.map((o) => (o._id === order._id ? order : o)),
  }))
);
