import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BankAccountsState } from '../reducers/bank-accounts.reducer';

export const selectBankAccountsState =
  createFeatureSelector<BankAccountsState>('bankAccounts');

export const selectBankAccounts = createSelector(
  selectBankAccountsState,
  (state) => state.bankAccounts
);

export const selectBankAccountsLoading = createSelector(
  selectBankAccountsState,
  (state) => state.loading
);

export const selectBankAccountsLoaded = createSelector(
  selectBankAccountsState,
  (state) => state.loaded
);
