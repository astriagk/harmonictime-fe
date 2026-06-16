import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadFilters } from 'src/app/store/actions/filters.actions';
import { selectFilterRecipients } from 'src/app/store/selectors/filters.selectors';

@Component({
  selector: 'app-recipient-filtering',
  templateUrl: './recipient-filtering.component.html',
  styleUrls: ['./recipient-filtering.component.scss'],
})
export class RecipientFilteringComponent implements OnInit, OnDestroy {
  public recipients: string[] = [];
  public recipient: string | null = null;

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
      .select(selectFilterRecipients)
      .pipe(takeUntil(this.destroy$))
      .subscribe((recipients) => (this.recipients = recipients));

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.recipient = params['recipient'] ? params['recipient'] : null;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleRecipientRoute(event: any) {
    const queryParams: Params = {
      recipient: (event.target as HTMLSelectElement).value,
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
