import { createAction, props } from '@ngrx/store';
import { IBlogAdminCard, IBlogQuery } from '@shared/types/blog-d-t';

// The admin list is paginated and filtered server-side, so the query travels
// with the action and the reducer caches the page it produced.
export const loadAdminBlogs = createAction(
  '[AdminBlogs] Load',
  props<{ query: IBlogQuery }>()
);

// Re-runs the last query — dispatch after a create / update / archive.
export const reloadAdminBlogs = createAction('[AdminBlogs] Reload');

export const loadAdminBlogsSuccess = createAction(
  '[AdminBlogs] Load Success',
  props<{ items: IBlogAdminCard[]; total: number; page: number; limit: number }>()
);

export const loadAdminBlogsFailure = createAction(
  '[AdminBlogs] Load Failure',
  props<{ error: string }>()
);
