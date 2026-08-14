import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BLOGS,
  BLOGS_ADMIN,
  BLOG_BY_ID,
  BLOG_CATEGORIES,
  BLOG_RELATED,
  BLOG_TAGS,
  UPLOAD_SINGLE,
} from '@config/index';
import { GenericService } from './generic.service';
import {
  IBlogAdminCard,
  IBlogCard,
  IBlogCategory,
  IBlogDetail,
  IBlogListResponse,
  IBlogQuery,
  ICreateBlogRequest,
  IUpdateBlogRequest,
} from '../types/blog-d-t';

const EMPTY_LIST: IBlogListResponse<any> = {
  items: [],
  total: 0,
  page: 1,
  limit: 0,
};

// Blog posts — contract in spec/blog-frontend-usage.md.
// Every response is { message, data }, so the payload always lives under .data.
// Public reads go out unauthenticated; admin calls use the *Token variants so
// GenericService attaches the Bearer header.
@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private genericService: GenericService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  // Published posts only, newest first, paginated server-side.
  list(query: IBlogQuery = {}): Observable<IBlogListResponse<IBlogCard>> {
    return this.genericService
      .getObservable(`${BLOGS}${this.toQueryString(query, 6)}`)
      .pipe(map((res: any) => res?.data ?? { ...EMPTY_LIST }));
  }

  // Accepts the slug (preferred) or the _id, so older id-based links keep
  // resolving. Errors are left to the caller — a 410 (archived) has to be told
  // apart from a 404.
  getBySlug(slugOrId: string): Observable<IBlogDetail> {
    return this.genericService
      .getObservable(`${BLOG_BY_ID}${slugOrId}`)
      .pipe(map((res: any) => res?.data));
  }

  related(slugOrId: string): Observable<IBlogCard[]> {
    return this.genericService
      .getObservable(BLOG_RELATED(slugOrId))
      .pipe(map((res: any) => res?.data ?? []));
  }

  categories(): Observable<IBlogCategory[]> {
    return this.genericService
      .getObservable(BLOG_CATEGORIES)
      .pipe(map((res: any) => res?.data ?? []));
  }

  // Tags already used by published posts, so the editor's picker grows as
  // authors coin new ones instead of being frozen to the seed list. The API
  // may return plain strings or `{ Tag, Count }` objects; both are flattened
  // to labels here. Not yet implemented server-side — callers must tolerate a
  // failure and fall back to the seeds.
  tags(): Observable<string[]> {
    return this.genericService.getObservable(BLOG_TAGS).pipe(
      map((res: any) =>
        (res?.data ?? [])
          .map((t: any) => (typeof t === 'string' ? t : t?.Tag ?? t?.Name))
          .filter(Boolean)
      )
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  // Includes drafts and archived posts; items carry Status/CreatedAt/UpdatedAt.
  adminList(query: IBlogQuery = {}): Observable<IBlogListResponse<IBlogAdminCard>> {
    return this.genericService
      .getObservableToken(`${BLOGS_ADMIN}${this.toQueryString(query, 10)}`)
      .pipe(map((res: any) => res?.data ?? { ...EMPTY_LIST }));
  }

  create(payload: ICreateBlogRequest): Observable<IBlogDetail> {
    return this.genericService
      .postObservableToken(BLOGS, payload)
      .pipe(map((res: any) => res?.data));
  }

  update(id: string, payload: IUpdateBlogRequest): Observable<IBlogDetail> {
    return this.genericService
      .putObservableToken(`${BLOG_BY_ID}${id}`, payload)
      .pipe(map((res: any) => res?.data));
  }

  // Soft delete — the post moves to Status: 'archived' and its URL starts
  // answering 410 rather than disappearing.
  archive(id: string): Observable<any> {
    return this.genericService.deleteObservableToken(`${BLOG_BY_ID}${id}`);
  }

  // ── Uploads ───────────────────────────────────────────────────────────────

  // The blog endpoints take URLs, not files: upload first, then send the URL.
  // Shared by the cover/banner pickers and the Quill image handler.
  uploadImage(file: File): Observable<string> {
    const form = new FormData();
    form.append('image', file); // field name must be "image"
    form.append('folder', 'blog'); // groups uploads under site-content/blog/
    return this.genericService
      .uploadFormDataToken(UPLOAD_SINGLE, form)
      .pipe(map((res: any) => res?.data?.url ?? res?.url ?? ''));
  }

  private toQueryString(query: IBlogQuery, defaultLimit: number): string {
    const params = new URLSearchParams({
      page: String(query.page ?? 1),
      limit: String(query.limit ?? defaultLimit),
    });
    if (query.category) params.set('Category', query.category);
    if (query.search) params.set('Search', query.search);
    if (query.status) params.set('Status', query.status);
    return `?${params.toString()}`;
  }
}
