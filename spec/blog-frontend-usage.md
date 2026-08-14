# Blog API — Frontend Usage

How to consume `/api/blogs` from the Angular app. The endpoints are live on the
backend; this file is the contract the frontend should code against.

> ## ⚠ Pending backend change: article body is now `Sections`
>
> The frontend has moved from a single `Content` HTML string to an **ordered
> list of sections**, and **`BannerImage` is gone**. The backend still needs to
> implement this.
>
> **Why.** With one HTML blob, images were embedded inline in the editor and
> ended up rendering away from the copy they belonged to — every picture
> stacking near the top with the text below it. Sections make the pairing
> explicit: each block is some text plus, optionally, one image shown directly
> beneath that text, in the order the author arranged them.
>
> | Removed | Added |
> |---|---|
> | `Content: string` | `Sections: IBlogSection[]` |
> | `BannerImage` | — (the article hero is now just `Image`) |
>
> ```ts
> export interface IBlogSection {
>   Heading?: string;  // optional sub-heading above the text, ≤200 chars
>   Content: string;   // sanitised HTML, min 10 chars. TEXT ONLY — no <img>
>   Image?: string;    // optional URL, rendered full width under the text
>   Caption?: string;  // optional caption under the image, ≤200 chars
> }
> ```
>
> **Rules for the backend:**
> - `Sections` is **required**, minimum 1 entry; each entry requires `Content`.
> - **Array order is the render order** — persist and return it unchanged.
> - Sanitise every `Sections[].Content` exactly as `Content` was sanitised, and
>   additionally **strip `<img>`** from it. Images belong in `Sections[].Image`.
> - The allowed tags inside a section are therefore:
>   `p, h3, h4, strong, em, ul, ol, li, a, blockquote, br`.
> - `Sections[].Image` is a URL from `/api/uploads/image`, same as `Image`.
> - `Excerpt`, `Image`, `Author`, `Category`, `Slug`, `Tags`, `Status`,
>   `PublishedAt` and `Seo` are unchanged.
>
> **Migrating existing rows.** A stored post with a `Content` string becomes a
> single section: `Sections: [{ Content }]`. Any `BannerImage` can be dropped —
> the detail page uses `Image` for the hero now. Inline `<img>` tags already
> inside a migrated `Content` are the one case where an image legitimately
> survives in section HTML; either leave them or lift each into its own section,
> but do not fail the migration on them.
>
> The rest of this document has been updated to match — `Content` no longer
> appears as a top-level field anywhere below.

Base URL: `{API_BASE}/api/blogs` (same origin/base as every other module).

---

## 1. Response envelope — read this first

Every endpoint in this backend answers with the **same envelope**, not the
`{ success, data }` shape sketched in `blog-api.md`:

```json
{ "message": "Blogs retrieved successfully", "data": { ... } }
```

- Success and failure both use it — the **HTTP status code** is the signal.
- On error, `data` is `null` (or Joi validation details on a `400`).

So the payload always lives under `.data`:

```ts
this.http.get<ApiResponse<BlogListResponse>>(url).pipe(map(r => r.data));
```

```ts
export interface ApiResponse<T> {
  message: string;
  data: T;
}
```

---

## 2. Types

```ts
// src/app/shared/types/blog-d-t.ts  — replaces the old static shape
export interface IBlogCard {
  _id: string;
  Slug: string;
  Title: string;
  Excerpt: string;      // plain text, safe to interpolate
  Image: string;
  Author: string;
  Category: string;
  PublishedAt: string;  // ISO 8601 — format in the UI, never pre-formatted
}

export interface IBlogSeo {
  MetaTitle?: string;
  MetaDescription?: string;
}

export interface IBlogSection {
  Heading?: string;  // optional sub-heading above the text, ≤200 chars
  Content: string;   // sanitised HTML, min 10 chars. TEXT ONLY — no <img>
  Image?: string;    // optional URL, rendered full width under the text
  Caption?: string;  // optional caption under the image, ≤200 chars
}

export interface IBlogDetail extends IBlogCard {
  Sections: IBlogSection[];    // the article body, in render order
  CategorySlug: string;
  Tags?: string[];
  Status: 'draft' | 'published' | 'archived';
  UpdatedAt: string;
  CreatedAt: string;
  Seo?: IBlogSeo;
}

export interface IBlogListResponse {
  items: IBlogCard[];
  total: number;   // total matching posts, NOT items.length — feed getPager()
  page: number;
  limit: number;
}

export interface IBlogCategory {
  Category: string;     // display label, e.g. "Buying Guides"
  CategorySlug: string; // e.g. "buying-guides"
  Count: number;
}
```

---

## 3. Public endpoints

### `GET /api/blogs` — grid list

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | `1` | 1-based |
| `limit` | number | `6` | Max `50` |
| `Category` | string | — | Accepts the label (`Buying Guides`) **or** the slug (`buying-guides`) |
| `Search` | string | — | Case-insensitive match on `Title` / `Excerpt` |

Returns `{ items, total, page, limit }`. Only published posts whose
`PublishedAt` has passed, newest first. Drafts and archived posts never appear.

### `GET /api/blogs/categories`

`IBlogCategory[]` for a category filter/sidebar. Counts published posts only.

### `GET /api/blogs/tags` — **not built yet**

The tag equivalent of `/categories`: every distinct tag in use, so the editor's
picker grows as authors coin new ones instead of being frozen to the seed list
in `shared/data/blog-options.ts`.

```json
{ "message": "Tags retrieved successfully",
  "data": [ { "Tag": "Rolex", "Count": 12 }, { "Tag": "Submariner", "Count": 4 } ] }
```

A bare `string[]` is accepted too — the service flattens either shape. Compare
case-insensitively when aggregating, so `rolex` and `Rolex` are one entry.

Until this exists the editor falls back to its seed list, and the request
failing is expected rather than exceptional — do not treat the 404 in the
console as a bug.

### `GET /api/blogs/:slugOrId` — detail

Accepts the `Slug` (preferred) or the `_id`, so the old `blog-details/:id`
route keeps working while you migrate to `blog-details/:slug`.

| Status | Meaning | UI |
|---|---|---|
| `200` | Post returned | Render |
| `404` | No such post | Not-found page |
| `410` | Post was archived | "This article has been removed" — do **not** show a generic 404 |

### `GET /api/blogs/:slugOrId/related`

Up to 3 `IBlogCard`s: same category first, topped up with the newest other
posts so the strip is never half-empty. `404` if the parent post isn't public.

---

## 4. Service

```ts
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly base = `${environment.apiUrl}/api/blogs`;

  constructor(private http: HttpClient) {}

  getBlogs(opts: { page?: number; limit?: number; category?: string; search?: string } = {})
    : Observable<IBlogListResponse> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 1))
      .set('limit', String(opts.limit ?? 6));
    if (opts.category) params = params.set('Category', opts.category);
    if (opts.search)   params = params.set('Search', opts.search);

    return this.http
      .get<ApiResponse<IBlogListResponse>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  getBlog(slugOrId: string): Observable<IBlogDetail> {
    return this.http
      .get<ApiResponse<IBlogDetail>>(`${this.base}/${slugOrId}`)
      .pipe(map(r => r.data));
  }

  getRelated(slugOrId: string): Observable<IBlogCard[]> {
    return this.http
      .get<ApiResponse<IBlogCard[]>>(`${this.base}/${slugOrId}/related`)
      .pipe(map(r => r.data));
  }

  getCategories(): Observable<IBlogCategory[]> {
    return this.http
      .get<ApiResponse<IBlogCategory[]>>(`${this.base}/categories`)
      .pipe(map(r => r.data));
  }
}
```

`UtilsService.blogs` / `filterBlogs()` / `getBlogById()` (backed by the static
`blog-data.ts`) should be deleted once components move to `BlogService`.

---

## 5. Component wiring

### Grid — `BlogAreaComponent`

Server-side pagination replaces the local `filter()` + `slice()`:

```ts
posts: IBlogCard[] = [];
page = 1;
limit = 6;
total = 0;
loading = false;

load(page = 1): void {
  this.loading = true;
  this.blogService.getBlogs({ page, limit: this.limit, category: this.category })
    .subscribe({
      next: res => {
        this.posts = res.items;
        this.total = res.total;   // getPager() must use this, not posts.length
        this.page = res.page;
        this.loading = false;
      },
      error: () => { this.posts = []; this.loading = false; },
    });
}
```

- Drop `filter(b => b.blog === 'blog-standard')` — the API already returns only
  published posts.
- Card link: `[routerLink]="['/blog-details', post.Slug || post._id]"`.

### Card — `BlogPostboxItemComponent`

Replace the hardcoded lorem paragraph with `{{ post.Excerpt }}`, the image with
`post.Image`, and the date with `post.PublishedAt | date: 'dd MMM, yyyy'`.

### Detail — `BlogDetailsAreaComponent`

```html
<img [src]="post.Image" [alt]="post.Title" />
<h1>{{ post.Title }}</h1>
<span>{{ post.Author }}</span>
<span>{{ post.PublishedAt | date: 'dd MMM, yyyy' }}</span>

<section class="blog-section" *ngFor="let section of post.Sections">
  <h3 *ngIf="section.Heading">{{ section.Heading }}</h3>
  <div class="blog-content" [innerHTML]="section.Content"></div>
  <figure *ngIf="section.Image">
    <img [src]="section.Image" [alt]="section.Caption || post.Title" />
    <figcaption *ngIf="section.Caption">{{ section.Caption }}</figcaption>
  </figure>
</section>

<ul class="tags" *ngIf="post.Tags?.length">
  <li *ngFor="let tag of post.Tags">{{ tag }}</li>
</ul>
```

Render `Sections` in array order — that order *is* the author's layout. The
image belongs **after** the text of its own section, which is the whole reason
the field exists.

Each `Sections[].Content` is sanitised server-side to a fixed whitelist —
`p, h3, h4, strong, em, ul, ol, li, a, blockquote, br` — with `<img>`, all event
handlers, `javascript:`/`data:` URLs, `<script>`, `<style>` and `<iframe>`
stripped, so `[innerHTML]` is safe. **Do not** wrap it in
`bypassSecurityTrustHtml`; there is no reason to defeat Angular's own pass.

Style the article body under `.blog-content` — the HTML carries no classes.

### Route

```ts
{ path: 'blog-details/:slug', component: BlogDynamicDetailsComponent }
```

One param serves both forms: pass whatever is in the URL straight to
`getBlog()`. Handle `410` distinctly from `404`:

```ts
error: (err: HttpErrorResponse) => {
  this.gone = err.status === 410;
  this.notFound = err.status === 404;
}
```

### SEO

```ts
this.title.setTitle(post.Seo?.MetaTitle || post.Title);
this.meta.updateTag({ name: 'description', content: post.Seo?.MetaDescription || post.Excerpt });
```

---

## 6. Admin endpoints

All require `Authorization: Bearer <token>` for a user holding the **admin**
role — same token as the rest of the admin panel. Non-admins get `403`.

| Method | Path | Body / params |
|---|---|---|
| `GET` | `/api/blogs/admin/list` | `page`, `limit`, `Category`, `Search`, `Status` (`draft`\|`published`\|`archived`). Includes drafts; items carry `Status`, `CreatedAt`, `UpdatedAt` |
| `POST` | `/api/blogs` | Create — returns `201` + the full post |
| `PUT` | `/api/blogs/:id` | Update, all fields optional — returns the updated post |
| `DELETE` | `/api/blogs/:id` | Soft delete → `Status: 'archived'`. `?hard=true` removes the document |

**Create body**

```json
{
  "Title": "How To Spot A Fake Submariner",
  "Slug": "how-to-spot-a-fake-submariner",
  "Excerpt": "Five details that separate a genuine Submariner from a replica.",
  "Sections": [
    { "Content": "<p>The cyclops lens is the first tell...</p>" },
    {
      "Heading": "The dial",
      "Content": "<p>Printing on a genuine dial is razor sharp...</p>",
      "Image": "https://cdn.krono2.com/blog/submariner-dial.jpg",
      "Caption": "A genuine dial under 10x magnification"
    }
  ],
  "Image": "https://cdn.krono2.com/blog/submariner.jpg",
  "Author": "Gowtham K",
  "Category": "Buying Guides",
  "Tags": ["rolex", "authentication"],
  "Status": "published",
  "PublishedAt": "2026-08-01T09:00:00.000Z",
  "Seo": { "MetaTitle": "…", "MetaDescription": "…" }
}
```

Required: `Title`, `Excerpt`, `Sections`, `Image`, `Author`, `Category`.
Everything else is optional.

Behaviour worth knowing in the editor UI:

- **`Slug`** — omit it and one is generated from `Title`; collisions get `-2`,
  `-3`, … Renaming the `Title` later does **not** move the slug (live URLs stay
  put); send `Slug` explicitly to change it.
- **`Excerpt`** — HTML is stripped on write, so it is always plain text.
- **`Sections`** — each `Content` is sanitised on write. Whatever the editor
  sends, what comes back is the whitelisted subset. Show the response body after
  save so authors see what was actually kept. Order is preserved exactly as
  sent, so a reorder in the UI is just a re-`PUT` of the whole array.
- **`Status: 'published'`** with no `PublishedAt` stamps the current time. A
  **future** `PublishedAt` schedules the post — it stays out of the public list
  until that moment, no cron needed.
- **Images** — upload via the existing `/api/uploads` endpoint first, then send
  the returned URL. The blog endpoints take URLs, not files.

---

## 7. Sending a post from the frontend

The whole create flow, end to end: upload images → build the payload → POST.

### 7.1 Field rules the form must mirror

Server-side Joi validation. Break one of these and you get a `400` before the
post is written, so enforce the same rules in the form to avoid a round trip.

| Field | Required | Rule |
|---|---|---|
| `Title` | Yes | string, 3–200 chars |
| `Excerpt` | Yes | string, 10–400 chars. Plain text — markup is stripped on write |
| `Sections` | Yes | array, **min 1 entry**. Order preserved |
| `Sections[].Heading` | No | string, max 200 |
| `Sections[].Content` | Yes | HTML string, min 10 chars. `<img>` stripped on write |
| `Sections[].Image` | No | URL. Omit the key entirely rather than sending `""` |
| `Sections[].Caption` | No | string, max 200 |
| `Image` | Yes | URL (absolute or relative). The cover image |
| `Author` | Yes | string, max 120 |
| `Category` | Yes | string, max 120 |
| `Slug` | No | string, max 120, `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Generated from `Title` when omitted |
| `Tags` | No | string[], each max 50. Defaults to `[]` |
| `Status` | No | `draft` \| `published` \| `archived`. Defaults to `draft` |
| `PublishedAt` | No | ISO 8601 date string |
| `Seo` | No | `{ MetaTitle?: string (≤200), MetaDescription?: string (≤400) }` |

Unknown keys are rejected — send only the fields above. In particular do **not**
send `_id`, `CategorySlug`, `CreatedAt`, or `UpdatedAt`; the server owns those.

### 7.2 Request types

```ts
export interface CreateBlogRequest {
  Title: string;
  Excerpt: string;
  Sections: IBlogSection[];
  Image: string;
  Author: string;
  Category: string;
  Slug?: string;
  Tags?: string[];
  Status?: 'draft' | 'published' | 'archived';
  PublishedAt?: string | null;   // ISO 8601
  Seo?: { MetaTitle?: string; MetaDescription?: string };
}

// PUT accepts the same fields, all optional — send only what changed.
export type UpdateBlogRequest = Partial<CreateBlogRequest>;
```

### 7.3 Step 1 — upload the images, get URLs back

The blog endpoints take **URLs, not files**. Upload first via the existing
uploader, then put the returned `url` in the payload.

```ts
uploadImage(file: File): Observable<string> {
  const form = new FormData();
  form.append('image', file);          // field name must be "image"
  form.append('folder', 'blog');       // optional — groups under site-content/blog/
  return this.http
    .post<ApiResponse<{ url: string }>>(`${environment.apiUrl}/api/uploads/image`, form)
    .pipe(map(r => r.data.url));
}
```

Do **not** set `Content-Type` yourself — the browser adds the multipart
boundary. Both the cover `Image` and every `Sections[].Image` come from this
endpoint. Nothing is ever inlined into the article HTML: the editor toolbar has
no image button, and the sanitiser strips `<img>` from `Sections[].Content`
regardless.

### 7.4 Step 2 — the service methods

```ts
// Add to BlogService. If your HttpInterceptor already attaches the bearer
// token, drop the `headers` argument entirely.
private get authHeaders(): HttpHeaders {
  return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
}

createBlog(payload: CreateBlogRequest): Observable<IBlogDetail> {
  return this.http
    .post<ApiResponse<IBlogDetail>>(this.base, payload, { headers: this.authHeaders })
    .pipe(map(r => r.data));
}

updateBlog(id: string, payload: UpdateBlogRequest): Observable<IBlogDetail> {
  return this.http
    .put<ApiResponse<IBlogDetail>>(`${this.base}/${id}`, payload, { headers: this.authHeaders })
    .pipe(map(r => r.data));
}

archiveBlog(id: string): Observable<void> {
  return this.http
    .delete<ApiResponse<null>>(`${this.base}/${id}`, { headers: this.authHeaders })
    .pipe(map(() => void 0));
}

adminList(opts: { page?: number; limit?: number; status?: string; search?: string } = {})
  : Observable<IBlogListResponse> {
  let params = new HttpParams()
    .set('page', String(opts.page ?? 1))
    .set('limit', String(opts.limit ?? 10));
  if (opts.status) params = params.set('Status', opts.status);
  if (opts.search) params = params.set('Search', opts.search);

  return this.http
    .get<ApiResponse<IBlogListResponse>>(`${this.base}/admin/list`, {
      params, headers: this.authHeaders,
    })
    .pipe(map(r => r.data));
}
```

### 7.5 Step 3 — the editor form

```ts
form = this.fb.group({
  Title:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
  Slug:        [''],                                    // blank = auto-generate
  Excerpt:     ['', [Validators.required, Validators.minLength(10), Validators.maxLength(400)]],
  Image:       ['', Validators.required],               // cover, filled by the uploader
  Author:      ['', Validators.required],
  Category:    ['', Validators.required],
  Tags:        [[] as string[]],
  Sections:    this.fb.array([this.newSection()]),      // never empty
  Status:      ['draft'],
  PublishedAt: [null as string | null],                 // set only when scheduling
  Seo: this.fb.group({
    MetaTitle:       ['', Validators.maxLength(200)],
    MetaDescription: ['', Validators.maxLength(400)],
  }),
});

private newSection(section?: IBlogSection): FormGroup {
  return this.fb.group({
    Heading: [section?.Heading ?? '', Validators.maxLength(200)],
    Content: [section?.Content ?? '', [Validators.required, Validators.minLength(10)]],
    Image:   [section?.Image ?? ''],
    Caption: [section?.Caption ?? '', Validators.maxLength(200)],
  });
}
```

The `Sections` `FormArray` is what the add / remove / reorder controls act on,
and rebuilding it is the first thing an edit does — patch the array length to
match the loaded post *before* `patchValue`, or the extra sections are dropped.

Every validator above mirrors a Joi rule, so keep the two in step. Note that a
validated control the admin cannot currently see — a slug behind its reveal, a
meta field in a collapsed panel — must still be surfaced when submit fails, or
the form rejects itself with nothing highlighted.

Flatten the form value into the payload, dropping every empty optional so the
server applies its own defaults instead of storing blanks:

```ts
private toPayload(): CreateBlogRequest {
  const v = this.form.getRawValue();

  const payload: CreateBlogRequest = {
    Title: v.Title!.trim(),
    Excerpt: v.Excerpt!.trim(),
    // Drop the empty optional keys per section — the server should store
    // nothing rather than a blank string.
    Sections: (v.Sections ?? []).map((s: any) => ({
      Content: s.Content ?? '',
      ...(s.Heading?.trim() ? { Heading: s.Heading.trim() } : {}),
      ...(s.Image?.trim()   ? { Image: s.Image.trim() }     : {}),
      ...(s.Caption?.trim() ? { Caption: s.Caption.trim() } : {}),
    })),
    Image: v.Image!,
    Author: v.Author!.trim(),
    Category: v.Category!.trim(),
    Status: v.Status as CreateBlogRequest['Status'],
  };

  if (v.Slug?.trim()) payload.Slug = v.Slug.trim();
  if (v.Tags?.length) payload.Tags = v.Tags;
  // Only send a date when the author actually scheduled one — omitting it lets
  // "published" stamp now.
  if (v.PublishedAt)  payload.PublishedAt = new Date(v.PublishedAt).toISOString();

  const metaTitle = v.Seo?.MetaTitle?.trim();
  const metaDescription = v.Seo?.MetaDescription?.trim();
  if (metaTitle || metaDescription) {
    payload.Seo = {
      ...(metaTitle ? { MetaTitle: metaTitle } : {}),
      ...(metaDescription ? { MetaDescription: metaDescription } : {}),
    };
  }

  return payload;
}

save(): void {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  this.saving = true;

  const req$ = this.blogId
    ? this.blogService.updateBlog(this.blogId, this.toPayload())
    : this.blogService.createBlog(this.toPayload());

  req$.subscribe({
    next: post => {
      this.saving = false;
      this.blogId = post._id;
      // Sections come back sanitised — rebuild the array from the response so
      // the editor shows exactly what was stored, not what was typed.
      this.patchFrom(post);
      this.router.navigate(['/admin/blogs']);
    },
    error: (err: HttpErrorResponse) => {
      this.saving = false;
      this.errors = this.mapValidationErrors(err);
    },
  });
}
```

Two buttons, one payload — "Save draft" sends `Status: 'draft'`, "Publish"
sends `Status: 'published'`. To unpublish, `PUT` with `Status: 'draft'`.

### 7.6 Handling the `400`

Joi failures come back in the envelope's `data` as an array — map them onto the
form controls rather than showing one generic toast:

```json
{
  "message": "Validation error",
  "data": [
    { "message": "\"Excerpt\" length must be at least 10 characters long",
      "path": ["Excerpt"], "type": "string.min" }
  ]
}
```

```ts
private mapValidationErrors(err: HttpErrorResponse): Record<string, string> {
  if (err.status !== 400 || !Array.isArray(err.error?.data)) {
    return { _: err.error?.message ?? 'Something went wrong' };
  }
  return err.error.data.reduce((acc: Record<string, string>, d: any) => {
    acc[d.path?.[0] ?? '_'] = d.message;
    return acc;
  }, {});
}
```

A failure inside the array carries a deeper path —
`["Sections", 1, "Content"]` — so keying on `path[0]` alone collapses every
section error onto the single key `Sections`. Join the path if you want to point
at the offending block.

### 7.7 The same request as curl

Handy for testing the editor's payload without the UI:

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"…"}' | jq -r .data.token)

curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "Title": "How To Spot A Fake Submariner",
    "Excerpt": "Five details that separate a genuine Submariner from a replica.",
    "Sections": [
      { "Content": "<p>The cyclops lens is the first tell.</p>" },
      { "Heading": "The dial",
        "Content": "<p>Look closely at the printing.</p>",
        "Image": "https://cdn.krono2.com/blog/submariner-dial.jpg",
        "Caption": "A genuine dial under 10x magnification" }
    ],
    "Image": "https://cdn.krono2.com/blog/submariner.jpg",
    "Author": "Gowtham K",
    "Category": "Buying Guides",
    "Tags": ["rolex", "authentication"],
    "Status": "published"
  }'
```

Response `201`:

```json
{
  "message": "Blog created successfully",
  "data": {
    "_id": "6a7dc9f509352f8a301ca2ce",
    "Slug": "how-to-spot-a-fake-submariner",
    "Title": "How To Spot A Fake Submariner",
    "Excerpt": "Five details that separate a genuine Submariner from a replica.",
    "Sections": [
      { "Content": "<p>The cyclops lens is the first tell.</p>" },
      { "Heading": "The dial",
        "Content": "<p>Look closely at the printing.</p>",
        "Image": "https://cdn.krono2.com/blog/submariner-dial.jpg",
        "Caption": "A genuine dial under 10x magnification" }
    ],
    "Image": "https://cdn.krono2.com/blog/submariner.jpg",
    "Author": "Gowtham K",
    "Category": "Buying Guides",
    "CategorySlug": "buying-guides",
    "Tags": ["rolex", "authentication"],
    "Status": "published",
    "PublishedAt": "2026-08-13T13:43:17.384Z",
    "CreatedAt": "2026-08-13T13:43:17.384Z",
    "UpdatedAt": "2026-08-13T13:43:17.384Z"
  }
}
```

Note what changed on the way in: `Slug` was generated, `CategorySlug` derived,
`PublishedAt` stamped — and had a `Sections[].Content` contained a `<script>`,
an `onclick` or an `<img>`, it would be gone from this response. The array order
is untouched.

---

## 8. Status codes

| Code | When |
|---|---|
| `200` | OK |
| `201` | Post created |
| `400` | Validation failed (`data` holds Joi details) or malformed `:id` |
| `401` | Missing/invalid token on an admin endpoint |
| `403` | Authenticated but not an admin |
| `404` | No published post matches the slug/id |
| `410` | Post exists but is archived |

---

## 9. Storage

Collection `Blogs` — schema documented in
[harmoniv_time_v2.dbml](../database/V2/harmoniv_time_v2.dbml) (`Content` table
group). Indexes are created at startup: unique `Slug`, plus
`(Status, PublishedAt)` and `(CategorySlug, Status, PublishedAt)` for the list
queries.
