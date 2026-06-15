import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WithdrawalsState } from '../reducers/withdrawals.reducer';

export const selectWithdrawalsState =
  createFeatureSelector<WithdrawalsState>('withdrawals');

export const selectWithdrawals = createSelector(
  selectWithdrawalsState,
  (state) => state.withdrawals
);

export const selectWithdrawalsLoading = createSelector(
  selectWithdrawalsState,
  (state) => state.loading
);

export const selectWithdrawalsLoaded = createSelector(
  selectWithdrawalsState,
  (state) => state.loaded
);
