import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadFilters } from 'src/app/store/actions/filters.actions';
import { selectFilterStrapMaterials } from 'src/app/store/selectors/filters.selectors';

@Component({
  selector: 'app-strap-material-filtering',
  templateUrl: './strap-material-filtering.component.html',
  styleUrls: ['./strap-material-filtering.component.scss'],
})
export class StrapMaterialFilteringComponent implements OnInit, OnDestroy {
  public strapMaterials: string[] = [];
  public strapMaterial: string | null = null;

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
      .select(selectFilterStrapMaterials)
      .pipe(takeUntil(this.destroy$))
      .subscribe((strapMaterials) => (this.strapMaterials = strapMaterials));

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.strapMaterial = params['strapMaterial'] ? params['strapMaterial'] : null;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.viewScroller.scrollToAnchor('products');
      });
  }
}
