import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadFilters } from 'src/app/store/actions/filters.actions';
import { selectFilterWatchMarkers } from 'src/app/store/selectors/filters.selectors';

@Component({
  selector: 'app-watch-marker-filtering',
  templateUrl: './watch-marker-filtering.component.html',
  styleUrls: ['./watch-marker-filtering.component.scss'],
})
export class WatchMarkerFilteringComponent implements OnInit, OnDestroy {
  public watchMarkers: string[] = [];
  public watchMarker: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadFilters());

    this.store
      .select(selectFilterWatchMarkers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((watchMarkers) => (this.watchMarkers = watchMarkers));

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.watchMarker = params['watchMarker'] ? params['watchMarker'] : null;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.viewScroller.scrollToAnchor('products');
      });
  }
}
