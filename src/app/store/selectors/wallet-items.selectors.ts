import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletItemsState } from '../reducers/wallet-items.reducer';

export const selectWalletItemsState =
  createFeatureSelector<WalletItemsState>('walletItems');

export const selectWalletItems = createSelector(
  selectWalletItemsState,
  (state) => state.items
);

export const selectWalletItemsStatus = createSelector(
  selectWalletItemsState,
  (state) => state.status
);

export const selectWalletItemsLoading = createSelector(
  selectWalletItemsState,
  (state) => state.loading
);
