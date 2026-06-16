import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrdersState } from '../reducers/orders.reducer';

// Feature Selector
export const selectOrdersState = createFeatureSelector<OrdersState>('orders');

// Select Orders
export const selectOrders = createSelector(
  selectOrdersState,
  (state) => state.orders
);

// Select Loading State
export const selectOrdersLoading = createSelector(
  selectOrdersState,
  (state) => state.loading
);

// Select Loaded flag (used by the effect's re-fetch guard)
export const selectOrdersLoaded = createSelector(
  selectOrdersState,
  (state) => state.loaded
);

// Select Error
export const selectOrdersError = createSelector(
  selectOrdersState,
  (state) => state.error
);
