import { createAction, props } from '@ngrx/store';

// Load Cart. `force: true` bypasses the loaded-cache guard (used after mutations).
export const loadCart = createAction(
  '[Cart] Load Cart',
  props<{ force?: boolean }>()
);

export const loadCartSuccess = createAction(
  '[Cart] Load Cart Success',
  props<{ cart: any[] }>()
);

export const loadCartFailure = createAction(
  '[Cart] Load Cart Failure',
  props<{ error: any }>()
);

// Update Cart (e.g., adding or removing items)
export const updateCart = createAction(
  '[Cart] Update Cart',
  props<{ cart: any[] }>()
);

// Patch a single item's quantity in-place — no server round-trip in the reducer
export const patchCartItemQty = createAction(
  '[Cart] Patch Item Qty',
  props<{ cartItemId: string; quantity: number }>()
);
