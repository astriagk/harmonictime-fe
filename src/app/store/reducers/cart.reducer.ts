import { createReducer, on } from '@ngrx/store';
import {
  loadCart,
  loadCartFailure,
  loadCartSuccess,
  patchCartItemQty,
  updateCart,
} from '../actions/cart.actions';

export interface CartState {
  cart: any[];
  error: string | null;
  loaded: boolean;
  loading: boolean;
}

// Start in the loading state: on a fresh load the cart hasn't resolved yet
// (server fetch for logged-in users, session hydration for guests), and we want
// the checkout skeleton — not the empty state — to show until it does.
export const initialState: CartState = {
  cart: [],
  error: null,
  loaded: false,
  loading: true,
};

export const cartReducer = createReducer(
  initialState,
  // `force` (after a mutation) always shows loading; a plain display dispatch
  // only shows loading on the first, un-cached load.
  on(loadCart, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),
  on(loadCartSuccess, (state, { cart }) => ({
    ...state,
    cart,
    loaded: true,
    loading: false,
    error: null,
  })),
  on(loadCartFailure, (state, { error }) => ({
    ...state,
    cart: [],
    loaded: false,
    loading: false,
    error,
  })),
  // Guest carts hydrate/update via this action rather than loadCart, so it also
  // marks the cart as resolved.
  on(updateCart, (state, { cart }) => ({
    ...state,
    cart,
    loaded: true,
    loading: false,
  })),
  // Patch a single item's quantity without triggering a loading state or re-fetch
  on(patchCartItemQty, (state, { cartItemId, quantity }) => ({
    ...state,
    cart: state.cart.map((item) =>
      item._id === cartItemId ? { ...item, Quantity: quantity } : item
    ),
  }))
);
