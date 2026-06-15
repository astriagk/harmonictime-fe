import { createReducer, on } from '@ngrx/store';
import {
  loadOrders,
  loadOrdersFailure,
  loadOrdersSuccess,
} from '../actions/orders.actions';
import { Order } from '../models/orders.models';

export interface OrdersState {
  orders: Order[];
  error: string | null;
  loaded: boolean;
  loading: boolean;
}

export const initialState: OrdersState = {
  orders: [],
  error: null,
  loaded: false,
  loading: false,
};

export const ordersReducer = createReducer(
  initialState,

  on(loadOrders, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),

  on(loadOrdersSuccess, (state, { orders }) => ({
    ...state,
    orders,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadOrdersFailure, (state, { error }) => ({
    ...state,
    orders: [],
    loaded: false,
    loading: false,
    error,
  }))
);
