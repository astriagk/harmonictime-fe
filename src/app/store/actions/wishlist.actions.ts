// --- app/store/wishlist/wishlist.actions.ts ---
import { createAction, props } from '@ngrx/store';
import { Product } from '../models/product.models';

export const loadWishlist = createAction('[Wishlist] Load Wishlist');
export const loadWishlistSuccess = createAction(
  '[Wishlist] Load Wishlist Success',
  props<{ items: Product[] }>()
);
export const addToWishlist = createAction(
  '[Wishlist] Add to Wishlist',
  props<{ product: Product }>()
);
export const removeFromWishlist = createAction(
  '[Wishlist] Remove from Wishlist',
  props<{ productId: number }>()
);
