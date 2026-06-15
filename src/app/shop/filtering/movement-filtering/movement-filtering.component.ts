import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadFilters } from 'src/app/store/actions/filters.actions';
import { selectFilterMovements } from 'src/app/store/selectors/filters.selectors';

@Component({
  selector: 'app-movement-filtering',
  templateUrl: './movement-filtering.component.html',
  styleUrls: ['./movement-filtering.component.scss'],
})
export class MovementFilteringComponent implements OnInit, OnDestroy {
  public movements: string[] = [];
  public movement: string | null = null;

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
      .select(selectFilterMovements)
      .pipe(takeUntil(this.destroy$))
      .subscribe((movements) => (this.movements = movements));

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.movement = params['movement'] ? params['movement'] : null;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.viewScroller.scrollToAnchor('products');
      });
  }
}
