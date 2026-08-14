import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadAdminBlogs,
  reloadAdminBlogs,
  loadAdminBlogsSuccess,
  loadAdminBlogsFailure,
} from '../actions/admin-blogs.actions';
import { selectAdminBlogsQuery } from '../selectors/admin-blogs.selectors';
import { BlogService } from '@shared/services/blog.service';
import { IBlogQuery } from '@shared/types/blog-d-t';

@Injectable()
export class AdminBlogsEffects {
  // switchMap, not exhaustMap: tab and page changes fire in quick succession
  // and the newest query must win.
  loadAdminBlogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminBlogs),
      switchMap(({ query }) => this.fetch(query))
    )
  );

  // Repeats whatever query the list is currently showing.
  reloadAdminBlogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadAdminBlogs),
      withLatestFrom(this.store.select(selectAdminBlogsQuery)),
      switchMap(([, query]) => this.fetch(query))
    )
  );

  private fetch(query: IBlogQuery) {
    return this.blogService.adminList(query).pipe(
      map((res) =>
        loadAdminBlogsSuccess({
          items: res?.items ?? [],
          total: res?.total ?? 0,
          page: res?.page ?? query.page ?? 1,
          limit: res?.limit ?? query.limit ?? 10,
        })
      ),
      catchError((err) =>
        of(
          loadAdminBlogsFailure({
            error: err?.error?.message ?? err?.message ?? 'Failed to load blog posts',
          })
        )
      )
    );
  }

  constructor(
    private actions$: Actions,
    private store: Store,
    private blogService: BlogService
  ) {}
}
