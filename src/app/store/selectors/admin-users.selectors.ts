import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminUsersState } from '../reducers/admin-users.reducer';

export const selectAdminUsersState =
  createFeatureSelector<AdminUsersState>('adminUsers');

export const selectAdminUsers = createSelector(
  selectAdminUsersState,
  (state) => state.users
);

export const selectAdminUsersLoading = createSelector(
  selectAdminUsersState,
  (state) => state.loading
);

export const selectAdminUsersLoaded = createSelector(
  selectAdminUsersState,
  (state) => state.loaded
);
