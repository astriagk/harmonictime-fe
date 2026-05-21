import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GET_CATEGORIES } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
})
export class CategoryFilterComponent {
  public categories: any[] = [];
  public category: string | null = null;

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService.getObservable(GET_CATEGORIES).subscribe({
      next: (response) => {
        const productCategories = response.data?.map(
          (el: any) => el?.CategoryName
        );
        this.categories = [...new Set(productCategories)];
      },
      error: (err) => {
        this.categories = [];
      },
    });
    this.route.queryParams.subscribe((params) => {
      this.category = params['category'] ? params['category'] : null;
    });
  }

  handleCategoryRoute(event: any) {
    const queryParams: Params = {
      category: (event.target as HTMLSelectElement).value,
    };
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products'); // Anchore Link
      });
  }
}
