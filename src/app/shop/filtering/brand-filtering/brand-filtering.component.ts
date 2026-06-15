import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadFilters } from 'src/app/store/actions/filters.actions';
import { selectFilterBrands } from 'src/app/store/selectors/filters.selectors';

@Component({
  selector: 'app-brand-filtering',
  templateUrl: './brand-filtering.component.html',
  styleUrls: ['./brand-filtering.component.scss'],
})
export class BrandFilteringComponent implements OnInit, OnDestroy {
  public brands: string[] = [];
  public brand: string | null = null;

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
      .select(selectFilterBrands)
      .pipe(takeUntil(this.destroy$))
      .subscribe((brands) => (this.brands = brands));

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.brand = params['brand'] ? params['brand'] : null;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleBrandRoute(event: any) {
    const queryParams: Params = {
      brand: (event.target as HTMLSelectElement).value,
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
