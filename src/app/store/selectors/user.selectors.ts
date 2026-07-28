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

export const selectUserRoles = createSelector(
  selectUserState,
  (state: UserState) => (state.user?.data?.roles as number[]) ?? []
);

export const selectSellerVerificationStatus = createSelector(
  selectUserState,
  (state: UserState) => (state.user?.data?.sellerVerificationStatus as string | null) ?? null
);

// The admin's note attached to a reject/request-info decision. This is the only
// place the seller is told *what* to fix, so it travels with the status above.
export const selectSellerVerificationNote = createSelector(
  selectUserState,
  (state: UserState) => (state.user?.data?.sellerVerificationNote as string | null) ?? null
);

export const selectIsLoggedIn = createSelector(
  selectUserState,
  (state: UserState) => !!state.user?.data
);
