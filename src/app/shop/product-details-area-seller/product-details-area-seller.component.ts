import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GET_PRODUCT_REVIEWS } from '@config/index';
import { GenericService } from '@shared/services/generic.service';

@Component({
  selector: 'app-product-details-area-seller',
  templateUrl: './product-details-area-seller.component.html',
  styleUrls: ['./product-details-area-seller.component.scss'],
})
export class ProductDetailsAreaSellerComponent implements OnChanges {
  @Input() product: any;

  public reviews: any[] = [];
  public reviewsLoaded = false;
  public stars = [1, 2, 3, 4, 5];

  private loadedForId?: string;

  constructor(
    private router: Router,
    private genericService: GenericService,
  ) {}

  // Load reviews once the product is available so the seller can see buyer
  // feedback on their own product (read-only — sellers don't post reviews).
  ngOnChanges(changes: SimpleChanges): void {
    const id = this.product?._id;
    if (id && id !== this.loadedForId) {
      this.loadedForId = id;
      this.loadReviews();
    }
  }

  get reviewCount(): number {
    return this.reviews.length;
  }

  get averageRating(): number {
    if (!this.reviews.length) {
      return 0;
    }
    const total = this.reviews.reduce(
      (sum, r) => sum + (Number(r?.Rating) || 0),
      0,
    );
    return Math.round(total / this.reviews.length);
  }

  loadReviews(): void {
    const productId = this.product?._id;
    if (!productId) {
      return;
    }
    this.genericService.getObservable(GET_PRODUCT_REVIEWS + productId).subscribe({
      next: (res: any) => {
        this.reviews = this.sortByNewest(this.extractReviews(res));
        this.reviewsLoaded = true;
      },
      error: () => {
        this.reviews = [];
        this.reviewsLoaded = true;
      },
    });
  }

  // The API may wrap the list in different envelopes; always resolve to an array
  private extractReviews(res: any): any[] {
    if (Array.isArray(res)) {
      return res;
    }
    const candidates = [
      res?.data,
      res?.reviews,
      res?.data?.reviews,
      res?.data?.docs,
      res?.result,
    ];
    return candidates.find((c) => Array.isArray(c)) ?? [];
  }

  // Show the most recent reviews first, based on the created date/time
  private sortByNewest(reviews: any[]): any[] {
    return [...reviews].sort((a, b) => {
      const dateA = new Date(a?.CreatedAt ?? a?.createdAt ?? 0).getTime();
      const dateB = new Date(b?.CreatedAt ?? b?.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  }

  itemDetails(item: any) {
    this.router.navigate(['/seller/add-product' + `/${item._id}`]);
  }
}
