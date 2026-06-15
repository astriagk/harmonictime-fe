import { createReducer, on } from '@ngrx/store';
import {
  loadWishlist,
  loadWishlistFailure,
  loadWishlistSuccess,
  updateWishlist,
} from '../actions/wishlist.actions';

export interface WishlistState {
  wishlist: any[];
  error: string | null;
  loaded: boolean;
  loading: boolean;
}

export const initialState: WishlistState = {
  wishlist: [],
  error: null,
  loaded: false,
  loading: false,
};

export const wishlistReducer = createReducer(
  initialState,
  // `force` (after a mutation) always shows loading; a plain display dispatch
  // only shows loading on the first, un-cached load.
  on(loadWishlist, (state, { force }) => ({
    ...state,
    loading: force ? true : !state.loaded,
    loaded: force ? false : state.loaded,
    error: null,
  })),
  on(loadWishlistSuccess, (state, { wishlist }) => ({
    ...state,
    wishlist,
    loaded: true,
    loading: false,
    error: null,
  })),
  on(loadWishlistFailure, (state, { error }) => ({
    ...state,
    wishlist: [],
    loaded: false,
    loading: false,
    error,
  })),
  on(updateWishlist, (state, { wishlist }) => ({
    ...state,
    wishlist,
    loaded: true,
    loading: false,
  }))
);
