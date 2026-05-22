import { createReducer, on } from '@ngrx/store';
import {
  loadWishlistFailure,
  loadWishlistSuccess,
  updateWishlist,
} from '../actions/wishlist.actions';

export interface WishlistState {
  wishlist: any[];
  error: string | null;
}

export const initialState: WishlistState = {
  wishlist: [],
  error: null,
};

export const wishlistReducer = createReducer(
  initialState,
  on(loadWishlistSuccess, (state, { wishlist }) => ({
    ...state,
    wishlist,
    error: null,
  })),
  on(loadWishlistFailure, (state, { error }) => ({
    ...state,
    wishlist: [],
    error,
  })),
  on(updateWishlist, (state, { wishlist }) => ({
    ...state,
    wishlist,
  }))
);
