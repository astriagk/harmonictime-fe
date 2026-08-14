// Starter options for the blog editor's Category and Tags pickers.
//
// These are seeds, not the whole vocabulary. Both pickers accumulate:
//   1. this file — so a fresh install never opens an empty dropdown;
//   2. whatever the API reports as already in use (`GET /api/blogs/categories`
//      and `GET /api/blogs/tags`);
//   3. anything an editor types into the picker's "Add" box.
// The union is de-duplicated case-insensitively, so an older post's `rolex` and
// the `Rolex` below collapse to one entry rather than offering both.
//
// Values are stored as plain display strings, so editing this file never breaks
// an existing post — it only changes what the dropdowns offer next time.
//
// Written in the casing they should appear in: these are rendered verbatim on
// the public post, under "Tags :" and in the article meta.

export const BLOG_CATEGORY_OPTIONS: string[] = [
  'Buying Guides',
  'Selling Guides',
  'Authentication',
  'Brand Stories',
  'Watch Reviews',
  'Collecting',
  'Market Insights',
  'Investment',
  'Watch Care',
  'Repairs & Servicing',
  'Watch History',
  'Complications',
  'Straps & Accessories',
  'Auctions',
  'Events & Fairs',
  'Interviews',
  'Beginner Guides',
  'Comparisons',
  'Industry News',
  'Krono² News',
];

export const BLOG_TAG_OPTIONS: string[] = [
  // Brands
  'Rolex',
  'Omega',
  'Patek Philippe',
  'Audemars Piguet',
  'Cartier',
  'TAG Heuer',
  'Breitling',
  'IWC',
  'Jaeger-LeCoultre',
  'Panerai',
  'Hublot',
  'Vacheron Constantin',
  'A. Lange & Söhne',
  'Zenith',
  'Tudor',
  'Grand Seiko',
  'Seiko',
  'Citizen',
  'Casio',
  'Longines',
  'Tissot',
  'Oris',
  'Hamilton',
  'Bell & Ross',
  'Chopard',
  'Blancpain',
  'Breguet',
  'Montblanc',
  'Rado',
  'Frederique Constant',

  // Models & families
  'Submariner',
  'Daytona',
  'Datejust',
  'GMT-Master',
  'Explorer',
  'Speedmaster',
  'Seamaster',
  'Royal Oak',
  'Nautilus',
  'Santos',
  'Tank',

  // Categories of watch
  'Dive Watches',
  'Dress Watches',
  'Pilot Watches',
  'Field Watches',
  'Chronographs',
  'GMT',
  'Moonphase',
  'Skeleton',
  'Tourbillon',

  // Movement & build
  'Automatic',
  'Manual Wind',
  'Quartz',
  'In-House Movement',
  'Titanium',
  'Ceramic',
  'Gold',
  'Stainless Steel',
  'Sapphire Crystal',

  // Buying, selling & ownership
  'Authentication',
  'Buying Guide',
  'Selling Guide',
  'Pre-Owned',
  'Vintage',
  'Investment',
  'Resale Value',
  'Price Guide',
  'Warranty',
  'Box & Papers',
  'Servicing',
  'Watch Care',
  'Water Resistance',
  'Straps',
  'Bracelets',
  'Watch Winders',
  'Storage',

  // Market & culture
  'Market Trends',
  'Auctions',
  'Limited Edition',
  'New Releases',
  'Collecting',
  'Watch Fairs',
  'Celebrity Watches',
  'Watch History',
];
