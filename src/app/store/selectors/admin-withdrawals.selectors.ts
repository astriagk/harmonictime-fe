import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminWithdrawalsState } from '../reducers/admin-withdrawals.reducer';

export const selectAdminWithdrawalsState =
  createFeatureSelector<AdminWithdrawalsState>('adminWithdrawals');

export const selectAdminWithdrawals = createSelector(
  selectAdminWithdrawalsState,
  (state) => state.withdrawals
);

export const selectAdminWithdrawalsLoading = createSelector(
  selectAdminWithdrawalsState,
  (state) => state.loading
);
