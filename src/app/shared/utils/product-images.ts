// Helpers for ordering a product's images by their IsPrimary flag.
// A product's `Images` array carries an `IsPrimary` boolean; the image flagged
// primary must be shown first everywhere (details, listings, cart, etc.). When
// none is flagged we fall back to the first image so behaviour is unchanged for
// older products.

interface ProductImage {
  ImageURL?: string;
  IsPrimary?: boolean;
  [key: string]: any;
}

/** The URL to show as the product's lead image (primary, else first). */
export function getPrimaryImageUrl(
  images: ProductImage[] | null | undefined,
): string {
  if (!images?.length) return '';
  const primary = images.find((img) => img?.IsPrimary);
  return (primary ?? images[0])?.ImageURL ?? '';
}

/**
 * The image to reveal on hover — the one shown after the primary (i.e. the
 * first non-primary image). Falls back to the primary when there's only one
 * image, so a single-image product just keeps showing it.
 */
export function getSecondaryImageUrl(
  images: ProductImage[] | null | undefined,
): string {
  if (!images?.length) return '';
  const ordered = sortImagesPrimaryFirst(images);
  return (ordered[1] ?? ordered[0])?.ImageURL ?? '';
}

/** A copy of the images with the primary one first, the rest in their original order. */
export function sortImagesPrimaryFirst<T extends ProductImage>(
  images: T[] | null | undefined,
): T[] {
  if (!images?.length) return [];
  // Stable sort: primary images bubble to the front, everything else keeps order.
  return [...images].sort(
    (a, b) => (b?.IsPrimary ? 1 : 0) - (a?.IsPrimary ? 1 : 0),
  );
}
