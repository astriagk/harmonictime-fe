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
  loading: boolean;
}

export const initialState: OrdersState = {
  orders: [],
  error: null,
  loading: false,
};

export const ordersReducer = createReducer(
  initialState,

  on(loadOrders, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loadOrdersSuccess, (state, { orders }) => ({
    ...state,
    orders,
    loading: false,
    error: null,
  })),

  on(loadOrdersFailure, (state, { error }) => ({
    ...state,
    orders: [],
    loading: false,
    error,
  }))
);
