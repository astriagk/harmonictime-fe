import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminBlogsState } from '../reducers/admin-blogs.reducer';

export const selectAdminBlogsState =
  createFeatureSelector<AdminBlogsState>('adminBlogs');

export const selectAdminBlogs = createSelector(
  selectAdminBlogsState,
  (state) => state.items
);

export const selectAdminBlogsTotal = createSelector(
  selectAdminBlogsState,
  (state) => state.total
);

export const selectAdminBlogsQuery = createSelector(
  selectAdminBlogsState,
  (state) => state.query
);

export const selectAdminBlogsLoading = createSelector(
  selectAdminBlogsState,
  (state) => state.loading
);

export const selectAdminBlogsError = createSelector(
  selectAdminBlogsState,
  (state) => state.error
);
