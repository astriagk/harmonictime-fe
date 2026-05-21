import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GET_MOVEMENTS } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-movement-filtering',
  templateUrl: './movement-filtering.component.html',
  styleUrls: ['./movement-filtering.component.scss'],
})
export class MovementFilteringComponent {
  public movements: any[] = [];
  public movement: string | null = null;

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService.getObservable(GET_MOVEMENTS).subscribe({
      next: (response) => {
        const productMovements = response.data?.map(
          (el: any) => el?.MovementName
        );
        this.movements = [...new Set(productMovements)];
      },
      error: (err) => {
        this.movements = [];
      },
    });
    this.route.queryParams.subscribe((params) => {
      this.movement = params['movement'] ? params['movement'] : null;
    });
  }

  handleMovementRoute(event: any) {
    const queryParams: Params = {
      movement: (event.target as HTMLSelectElement).value,
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
