import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GET_WATCH_MARKERS } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-watch-marker-filtering',
  templateUrl: './watch-marker-filtering.component.html',
  styleUrls: ['./watch-marker-filtering.component.scss'],
})
export class WatchMarkerFilteringComponent {
  public watchMarkers: any[] = [];
  public watchMarker: string | null = null;

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService.getObservable(GET_WATCH_MARKERS).subscribe({
      next: (response) => {
        const productWatchMarkers = response.data?.map(
          (el: any) => el?.WatchMarkerName
        );
        this.watchMarkers = [...new Set(productWatchMarkers)];
      },
      error: (err) => {
        this.watchMarkers = [];
      },
    });
    this.route.queryParams.subscribe((params) => {
      this.watchMarker = params['watchMarker'] ? params['watchMarker'] : null;
    });
  }

  handleWatchMarkerRoute(event: any) {
    const queryParams: Params = {
      watchMarker: (event.target as HTMLSelectElement).value,
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
