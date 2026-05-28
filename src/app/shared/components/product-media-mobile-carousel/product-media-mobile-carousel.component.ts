import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { sortImagesPrimaryFirst } from '../../utils/product-images';

@Component({
  selector: 'app-product-media-mobile-carousel',
  templateUrl: './product-media-mobile-carousel.component.html',
  styleUrls: ['./product-media-mobile-carousel.component.scss'],
})
export class ProductMediaMobileCarouselComponent implements OnChanges {
  @Input() images: any[] = [];
  @Output() mediaSelected = new EventEmitter<{ url: string; isVideo: boolean }>();

  orderedImages: any[] = [];
  activeIndex = 0;
  private touchStartX = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images']) {
      this.orderedImages = sortImagesPrimaryFirst(this.images);
      this.activeIndex = 0;
    }
  }

  goTo(index: number): void {
    this.activeIndex = index;
    const img = this.orderedImages[index];
    this.mediaSelected.emit({ url: img.ImageURL, isVideo: img.mediaType === 'video' });
  }

  next(): void {
    if (this.activeIndex < this.orderedImages.length - 1) {
      this.goTo(this.activeIndex + 1);
    }
  }

  prev(): void {
    if (this.activeIndex > 0) {
      this.goTo(this.activeIndex - 1);
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const delta = event.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(delta) > 40) {
      delta < 0 ? this.next() : this.prev();
    }
  }
}
