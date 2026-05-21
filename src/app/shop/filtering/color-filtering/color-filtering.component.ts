import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  DIAL_COLOR_OPTIONS,
  getDialColorSwatch,
  normalizeDialColor,
} from '@shared/constants/dial-colors';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-color-filtering',
  templateUrl: './color-filtering.component.html',
  styleUrls: ['./color-filtering.component.scss'],
})
export class ColorFilteringComponent {
  // Use only the curated colors defined in constants (not fetched from the API).
  public all_colors: string[] = [...DIAL_COLOR_OPTIONS];
  public color: string | null = null;

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.color = params['color'] ? normalizeDialColor(params['color']) : null;
    });
  }

  getColorStyles(color: string): Record<string, string> {
    const swatch = getDialColorSwatch(color);

    return {
      '--swatch-accent': swatch.accent,
      '--swatch-background': swatch.background,
      '--swatch-border': swatch.border ?? '1px solid transparent',
      '--swatch-shadow': swatch.boxShadow ?? 'none',
    };
  }

  trackByColor(_: number, color: string): string {
    return color;
  }

  normalizeColor(color: string): string {
    return normalizeDialColor(color);
  }

  handleColor(color: string) {
    // Define the query parameters as an object
    const queryParams: Params = {
      color: normalizeDialColor(color),
    };

    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams, // Pass the queryParams object here
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products'); // Anchore Link
      });
  }
}
