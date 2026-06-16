import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SellerOffersState } from '../reducers/seller-offers.reducer';

export const selectSellerOffersState =
  createFeatureSelector<SellerOffersState>('sellerOffers');

export const selectSellerOffers = createSelector(
  selectSellerOffersState,
  (state) => state.offers
);

export const selectSellerOffersLoading = createSelector(
  selectSellerOffersState,
  (state) => state.loading
);
