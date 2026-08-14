// Legacy shape backing the static `blog-data.ts` fixtures. Still used by the
// home page blog strip, the blog slider and the blog item card. New work should
// use the API types below, which mirror spec/blog-frontend-usage.md.
interface IBlogType {
  id:number,
  img:string,
  title:string,
  author:string,
  date:string,
  desc:string,
  blog?:string,
}

export default IBlogType;

export type BlogStatus = 'draft' | 'published' | 'archived';

// Every endpoint in this backend answers with { message, data } — the HTTP
// status is the success signal, not a boolean in the body.
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface IBlogSeo {
  MetaTitle?: string;
  MetaDescription?: string;
}

// What the list endpoints return per post — everything a grid card renders.
export interface IBlogCard {
  _id: string;
  Slug: string;
  Title: string;
  Excerpt: string; // plain text, safe to interpolate
  Image: string;
  Author: string;
  Category: string;
  PublishedAt: string; // ISO 8601 — format in the UI, never pre-formatted
}

// Admin list items carry the editorial fields on top of the card shape.
export interface IBlogAdminCard extends IBlogCard {
  Status: BlogStatus;
  CreatedAt: string;
  UpdatedAt: string;
}

// One block of the article: some text, and optionally an image shown beneath
// it. Posts are built from an ordered list of these so an author can put a
// picture next to the paragraph it illustrates, rather than dumping every image
// at the top.
export interface IBlogSection {
  Heading?: string; // optional sub-heading above the text
  Content: string; // sanitised HTML — text only, never <img>
  Image?: string; // optional image rendered under the text
  Caption?: string; // optional caption under the image
}

// GET /api/blogs/:slugOrId
export interface IBlogDetail extends IBlogCard {
  Sections: IBlogSection[]; // the article body, in order
  CategorySlug: string;
  Tags?: string[];
  Status: BlogStatus;
  UpdatedAt: string;
  CreatedAt: string;
  Seo?: IBlogSeo;
}

export interface IBlogListResponse<T = IBlogCard> {
  items: T[];
  total: number; // total matching posts, NOT items.length — feed getPager()
  page: number;
  limit: number;
}

export interface IBlogCategory {
  Category: string; // display label, e.g. "Buying Guides"
  CategorySlug: string; // e.g. "buying-guides"
  Count: number;
}

// POST /api/blogs. Unknown keys are rejected, so never spread a form value
// straight in — `_id`, `CategorySlug`, `CreatedAt` and `UpdatedAt` are the
// server's to set.
export interface ICreateBlogRequest {
  Title: string;
  Excerpt: string;
  Sections: IBlogSection[];
  Image: string;
  Author: string;
  Category: string;
  Slug?: string;
  Tags?: string[];
  Status?: BlogStatus;
  PublishedAt?: string | null; // ISO 8601
  Seo?: IBlogSeo;
}

// PUT accepts the same fields, all optional.
export type IUpdateBlogRequest = Partial<ICreateBlogRequest>;

export interface IBlogQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: BlogStatus | '';
}
