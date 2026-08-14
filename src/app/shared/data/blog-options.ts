// Starter options for the blog editor's Category and Tags pickers.
//
// The API owns the real values — `GET /api/blogs/categories` returns whatever
// has actually been used, and both fields accept free text via [addTag]. These
// lists just stop the dropdowns opening empty on a fresh install, and give
// editors a consistent vocabulary to pick from rather than inventing a new
// spelling each time. Anything chosen here is stored as a plain string, so
// editing this file never breaks existing posts.

export const BLOG_CATEGORY_OPTIONS: string[] = [
  'Buying Guides',
  'Authentication',
  'Brand Stories',
  'Collecting',
  'Market Insights',
  'Watch Care',
  'Krono² News',
];

export const BLOG_TAG_OPTIONS: string[] = [
  'rolex',
  'omega',
  'tag-heuer',
  'seiko',
  'vintage',
  'authentication',
  'buying-guide',
  'investment',
  'servicing',
  'straps',
];
