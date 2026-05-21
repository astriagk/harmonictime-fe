import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GET_STRAP_MATERIALS } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-strap-material-filtering',
  templateUrl: './strap-material-filtering.component.html',
  styleUrls: ['./strap-material-filtering.component.scss'],
})
export class StrapMaterialFilteringComponent {
  public strapMaterials: any[] = [];
  public strapMaterial: string | null = null;

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService.getObservable(GET_STRAP_MATERIALS).subscribe({
      next: (response) => {
        const productStrapMaterials = response.data?.map(
          (el: any) => el?.StrapMaterialName
        );
        this.strapMaterials = [...new Set(productStrapMaterials)];
      },
      error: (err) => {
        this.strapMaterials = [];
      },
    });
    this.route.queryParams.subscribe((params) => {
      this.strapMaterial = params['strapMaterial']
        ? params['strapMaterial']
        : null;
    });
  }

  handleStrapMaterialRoute(event: any) {
    const queryParams: Params = {
      strapMaterial: (event.target as HTMLSelectElement).value,
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
