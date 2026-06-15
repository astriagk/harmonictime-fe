import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { loadProductDetail } from 'src/app/store/actions/product.actions';
import {
  selectProductDetail,
  selectProductDetailLoading,
} from 'src/app/store/selectors/product.selectors';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  public product: any;
  public loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private store: Store
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const id = params.get('id');
        if (!id) {
          this.router.navigate(['/404']);
          return;
        }
        this.store.dispatch(loadProductDetail({ id }));
      });

    this.store
      .select(selectProductDetailLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectProductDetail)
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        this.product = product;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
