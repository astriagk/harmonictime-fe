import { createReducer, on } from '@ngrx/store';
import {
  loadCart,
  loadCartFailure,
  loadCartSuccess,
  updateCart,
} from '../actions/cart.actions';

export interface CartState {
  cart: any[];
  error: string | null;
  loading: boolean;
}

// Start in the loading state: on a fresh load the cart hasn't resolved yet
// (server fetch for logged-in users, session hydration for guests), and we want
// the checkout skeleton — not the empty state — to show until it does.
export const initialState: CartState = {
  cart: [],
  error: null,
  loading: true,
};

export const cartReducer = createReducer(
  initialState,
  on(loadCart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(loadCartSuccess, (state, { cart }) => ({
    ...state,
    cart,
    loading: false,
    error: null,
  })),
  on(loadCartFailure, (state, { error }) => ({
    ...state,
    cart: [],
    loading: false,
    error,
  })),
  // Guest carts hydrate/update via this action rather than loadCart, so it also
  // marks the cart as resolved.
  on(updateCart, (state, { cart }) => ({
    ...state,
    cart,
    loading: false,
  }))
);
