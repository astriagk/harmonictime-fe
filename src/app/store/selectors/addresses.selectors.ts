import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AddressesState } from '../reducers/addresses.reducer';

export const selectAddressesState =
  createFeatureSelector<AddressesState>('addresses');

export const selectAddresses = createSelector(
  selectAddressesState,
  (state) => state.addresses
);

export const selectAddressesLoading = createSelector(
  selectAddressesState,
  (state) => state.loading
);

export const selectAddressesLoaded = createSelector(
  selectAddressesState,
  (state) => state.loaded
);
