// Helpers for ordering a product's images by their IsPrimary flag.
// A product's `Images` array carries an `IsPrimary` boolean; the image flagged
// primary must be shown first everywhere (details, listings, cart, etc.). When
// none is flagged we fall back to the first image so behaviour is unchanged for
// older products.

interface ProductImage {
  ImageURL?: string;
  IsPrimary?: boolean;
  mediaType?: string;
  [key: string]: any;
}

/** The URL to show as the product's lead image (primary, else first). Videos are excluded. */
export function getPrimaryImageUrl(
  images: ProductImage[] | null | undefined,
): string {
  if (!images?.length) return '';
  const imageOnly = images.filter((img) => img?.mediaType !== 'video');
  const pool = imageOnly.length ? imageOnly : images;
  const primary = pool.find((img) => img?.IsPrimary);
  return (primary ?? pool[0])?.ImageURL ?? '';
}

/**
 * The image to reveal on hover — the first non-primary image. Videos are excluded.
 * Falls back to the primary when there's only one image.
 */
export function getSecondaryImageUrl(
  images: ProductImage[] | null | undefined,
): string {
  if (!images?.length) return '';
  const imageOnly = images.filter((img) => img?.mediaType !== 'video');
  const ordered = sortImagesPrimaryFirst(imageOnly.length ? imageOnly : images);
  return (ordered[1] ?? ordered[0])?.ImageURL ?? '';
}

/**
 * Images first (primary image at top), videos last.
 */
export function sortImagesPrimaryFirst<T extends ProductImage>(
  images: T[] | null | undefined,
): T[] {
  if (!images?.length) return [];
  return [...images].sort((a, b) => {
    const aIsVideo = a?.mediaType === 'video';
    const bIsVideo = b?.mediaType === 'video';
    if (aIsVideo !== bIsVideo) return aIsVideo ? 1 : -1;
    return (b?.IsPrimary ? 1 : 0) - (a?.IsPrimary ? 1 : 0);
  });
}
