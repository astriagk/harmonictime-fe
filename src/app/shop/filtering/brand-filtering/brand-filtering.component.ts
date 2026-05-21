import { ViewportScroller } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GET_BRANDS } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-brand-filtering',
  templateUrl: './brand-filtering.component.html',
  styleUrls: ['./brand-filtering.component.scss'],
})
export class BrandFilteringComponent {
  public brands: any[] = [];
  public brand: string | null = null;

  selectedBrands: string[] = [];

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService.getObservable(GET_BRANDS).subscribe({
      next: (response) => {
        const productColors = response.data?.map((el: any) => el?.BrandName);
        this.brands = [...new Set(productColors)];
      },
      error: (err) => {
        this.brands = [];
      },
    });
    this.route.queryParams.subscribe((params) => {
      this.brand = params['brand'] ? params['brand'] : null;
    });
  }

  handleBrandRoute(event: any) {
    // const brands = this.selectedBrands;
    // // Define the query parameters as an object
    // const queryParams: Params = {
    //   brand: this.selectedBrands.map((b) => b.toLowerCase()).join(', '),
    // };
    const queryParams: Params = {
      brand: (event.target as HTMLSelectElement).value,
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
