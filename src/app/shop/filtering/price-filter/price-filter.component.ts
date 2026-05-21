import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  Output,
  Input,
  EventEmitter,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Options } from 'ngx-slider-v2';
import { ViewportScroller } from '@angular/common';
import { ProductService } from 'src/app/shared/services/product.service';

type PriceRange = {
  value: number;
  label: string;
  minPrice: number;
  maxPrice: number;
};

@Component({
  selector: 'app-price-filter',
  templateUrl: './price-filter.component.html',
  styleUrls: ['./price-filter.component.scss'],
})
export class PriceFilterComponent {
  public collapse: boolean = true;
  public isBrowser: boolean = false;
  public prices: any = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true; // for ssr
    }
  }

  ngOnInit(): void {
    const priceRanges = this.generatePriceRanges([
      10000, 10000, 30000, 50000, 100000, 400000, 500000, 1000000,
    ]);
    this.prices = priceRanges;
  }

  generatePriceRanges = (steps: number[]): PriceRange[] => {
    const ranges: PriceRange[] = [];
    let minPrice = 0;

    for (const step of steps) {
      const maxPrice = minPrice + step;
      ranges.push({
        value: maxPrice,
        label: `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`,
        minPrice,
        maxPrice,
      });
      minPrice = maxPrice;
    }

    return ranges;
  };

  // handle price filtering
  handlePriceRoute(event: any) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const values = this.prices.find(
      (p: any) => p.value.toString() === selectedValue
    );
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { minPrice: values?.minPrice, maxPrice: values?.maxPrice },
        queryParamsHandling: 'merge', // preserve the existing query params in the route
        skipLocationChange: false, // do trigger navigation
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products');
      });
  }
}
