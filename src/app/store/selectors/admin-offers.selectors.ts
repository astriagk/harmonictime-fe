import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminOffersState } from '../reducers/admin-offers.reducer';

export const selectAdminOffersState = createFeatureSelector<AdminOffersState>('adminOffers');

export const selectAdminOffers = createSelector(
  selectAdminOffersState,
  (state) => state.offers
);

export const selectAdminOffersLoading = createSelector(
  selectAdminOffersState,
  (state) => state.loading
);

export const selectAdminOffersLoaded = createSelector(
  selectAdminOffersState,
  (state) => state.loaded
);
