import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../reducers/user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUserData = createSelector(
  selectUserState,
  (state: UserState) => {
    return state;
  }
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);

export const selectIsAccountRestricted = createSelector(
  selectUserState,
  (state: UserState) => ({ blocked: state.blocked, suspended: state.suspended })
);
