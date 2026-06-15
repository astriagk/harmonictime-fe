import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from '../reducers/wallet.reducer';

export const selectWalletState = createFeatureSelector<WalletState>('wallet');

export const selectWallet = createSelector(
  selectWalletState,
  (state) => state.wallet
);

export const selectWalletLoading = createSelector(
  selectWalletState,
  (state) => state.loading
);

export const selectWalletLoaded = createSelector(
  selectWalletState,
  (state) => state.loaded
);
