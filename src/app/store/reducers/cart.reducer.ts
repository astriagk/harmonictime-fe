import { createReducer, on } from '@ngrx/store';
import {
  loadCartFailure,
  loadCartSuccess,
  updateCart,
} from '../actions/cart.actions';

export interface CartState {
  cart: any[];
  error: string | null;
}

export const initialState: CartState = {
  cart: [],
  error: null,
};

export const cartReducer = createReducer(
  initialState,
  on(loadCartSuccess, (state, { cart }) => ({
    ...state,
    cart,
    error: null,
  })),
  on(loadCartFailure, (state, { error }) => ({
    ...state,
    cart: [],
    error,
  })),
  on(updateCart, (state, { cart }) => ({
    ...state,
    cart,
  }))
);
