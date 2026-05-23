import { Pipe, PipeTransform } from '@angular/core';
import {
  getPrimaryImageUrl,
  getSecondaryImageUrl,
} from '../utils/product-images';

// Returns a product's lead image URL — the one flagged IsPrimary, or the first
// image as a fallback. Use on the Images array, e.g.
//   <img [src]="product.Images | primaryImage" />
@Pipe({
  name: 'primaryImage',
})
export class PrimaryImagePipe implements PipeTransform {
  transform(images: any[] | null | undefined): string {
    return getPrimaryImageUrl(images);
  }
}

// Returns the hover image URL — the first non-primary image, falling back to
// the primary when the product has only one image.
//   <img [src]="product.Images | secondaryImage" />
@Pipe({
  name: 'secondaryImage',
})
export class SecondaryImagePipe implements PipeTransform {
  transform(images: any[] | null | undefined): string {
    return getSecondaryImageUrl(images);
  }
}
