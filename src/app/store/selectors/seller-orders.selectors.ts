import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SellerOrdersState } from '../reducers/seller-orders.reducer';

export const selectSellerOrdersState = createFeatureSelector<SellerOrdersState>('sellerOrders');

export const selectSellerOrders = createSelector(
  selectSellerOrdersState,
  (state) => state.orders
);

export const selectSellerOrdersLoading = createSelector(
  selectSellerOrdersState,
  (state) => state.loading
);

export const selectSellerOrdersLoaded = createSelector(
  selectSellerOrdersState,
  (state) => state.loaded
);
