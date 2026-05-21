// --- app/store/wishlist/wishlist.reducer.ts ---
import { createReducer, on } from '@ngrx/store';
import * as WishlistActions from '../actions/wishlist.actions';
import { Product } from '../models/product.models';

export interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

export const wishlistReducer = createReducer(
  initialState,
  on(WishlistActions.loadWishlist, (state) => ({ ...state, loading: true })),
  on(WishlistActions.loadWishlistSuccess, (state, { items }) => ({
    ...state,
    items,
    loading: false,
  })),
  on(WishlistActions.addToWishlist, (state, { product }) => ({
    ...state,
    items: [...state.items, product],
  })),
  on(WishlistActions.removeFromWishlist, (state, { productId }) => ({
    ...state,
    items: state.items.filter((item) => item.id !== productId),
  }))
);
