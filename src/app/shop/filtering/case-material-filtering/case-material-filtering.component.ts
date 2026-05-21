import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GET_CASE_MATERIALS } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-case-material-filtering',
  templateUrl: './case-material-filtering.component.html',
  styleUrls: ['./case-material-filtering.component.scss'],
})
export class CaseMaterialFilteringComponent {
  public caseMaterials: any[] = [];
  public caseMaterial: string | null = null;

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService.getObservable(GET_CASE_MATERIALS).subscribe({
      next: (response) => {
        const productCaseMaterials = response.data?.map(
          (el: any) => el?.CaseMaterialName
        );
        this.caseMaterials = [...new Set(productCaseMaterials)];
      },
      error: (err) => {
        this.caseMaterials = [];
      },
    });
    this.route.queryParams.subscribe((params) => {
      this.caseMaterial = params['caseMaterial']
        ? params['caseMaterial']
        : null;
    });
  }

  handleCaseMaterialRoute(event: any) {
    const queryParams: Params = {
      caseMaterial: (event.target as HTMLSelectElement).value,
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
