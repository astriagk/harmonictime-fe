import { createReducer, on } from '@ngrx/store';
import { IBlogAdminCard, IBlogQuery } from '@shared/types/blog-d-t';
import {
  loadAdminBlogs,
  reloadAdminBlogs,
  loadAdminBlogsSuccess,
  loadAdminBlogsFailure,
} from '../actions/admin-blogs.actions';

export interface AdminBlogsState {
  items: IBlogAdminCard[];
  total: number;
  query: IBlogQuery;
  loading: boolean;
  error: string | null;
}

export const initialState: AdminBlogsState = {
  items: [],
  total: 0,
  query: { page: 1, limit: 10 },
  loading: false,
  error: null,
};

export const adminBlogsReducer = createReducer(
  initialState,

  // The query is stored on the way out so Reload can repeat it.
  on(loadAdminBlogs, (state, { query }) => ({
    ...state,
    query,
    loading: true,
    error: null,
  })),

  on(reloadAdminBlogs, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loadAdminBlogsSuccess, (state, { items, total, page, limit }) => ({
    ...state,
    items,
    total,
    query: { ...state.query, page, limit },
    loading: false,
    error: null,
  })),

  on(loadAdminBlogsFailure, (state, { error }) => ({
    ...state,
    items: [],
    total: 0,
    loading: false,
    error,
  }))
);
