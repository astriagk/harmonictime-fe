import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PRODUCT, UPDATE_PRODUCT_BY_ID, OFFERS, BULK_OFFER } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { UtilsService } from '@shared/services/utils.service';
import { ToastrService } from 'ngx-toastr';
import { filter, finalize, Subscription, switchMap } from 'rxjs';
import { ProductService } from 'src/app/shared/services/product.service';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

interface Offer {
  _id: string;
  OfferName: string;
  Description?: string;
  DiscountPercentage: number;
  StartDate: string;
  EndDate: string;
  IsActive: boolean;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  public orders: any[] = [];
  public paginationOrders: any[] = [];
  public paginate: any = {};
  public pageSize = 10;
  public pageNo: number = 1;
  public loading = true;
  private subscriptions: Subscription = new Subscription();
  private userData: any;

  // Offer modal state
  isOfferModalOpen = false;
  offers: Offer[] = [];
  offersLoading = false;
  selectedOfferId: string | null = null;
  selectedProductIds: Set<string> = new Set();
  isSavingOffer = false;

  constructor(
    private store: Store,
    public productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private viewScroller: ViewportScroller,
    private genericService: GenericService,
    public utilsService: UtilsService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select(selectUserData)
        .pipe(
          filter((state) => !!state?.user?.data),
          switchMap((state) => {
            this.userData = state.user.data;
            return this.loadProducts();
          }),
        )
        .subscribe({
          next: (response) => {
            this.orders = response?.data || [];
            this.updatePagination();
          },
          error: (err) => console.error(`Error fetching product data:`, err),
        }),
    );

    this.subscriptions.add(
      this.route.queryParams.subscribe((params) => {
        this.pageNo = params['page'] ? Number(params['page']) : this.pageNo;
        this.updatePagination();
      }),
    );
  }

  private loadProducts() {
    this.loading = true;
    const url = `${PRODUCT}?UserID=${this.userData._id}&IsAvailable=all`;
    return this.genericService.getObservable(url).pipe(
      finalize(() => (this.loading = false)),
    );
  }

  private reloadProducts(): void {
    this.loadProducts().subscribe({
      next: (response) => {
        this.orders = response?.data || [];
        this.updatePagination();
      },
      error: () => this.toastrService.error('Failed to refresh products'),
    });
  }

  updatePagination(): void {
    if (!this.orders.length) return;
    this.paginate = this.productService.getPager(
      this.orders.length,
      this.pageNo,
      this.pageSize,
    );
    this.paginationOrders = this.orders.slice(
      this.paginate.startIndex,
      this.paginate.endIndex + 1,
    );
  }

  setPage(page: number): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page: page },
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
      });
  }

  toggleAvailability(product: any, event: Event): void {
    event.stopPropagation();
    const newValue = !product.IsAvailable;
    product.IsAvailable = newValue;

    this.subscriptions.add(
      this.genericService
        .putObservable(`${UPDATE_PRODUCT_BY_ID}${product._id}`, {
          IsAvailable: newValue,
        })
        .subscribe({
          next: () => {
            this.toastrService.success(
              newValue ? 'Product marked available.' : 'Product marked unavailable.',
            );
          },
          error: (err) => {
            console.error('Error updating availability:', err);
            product.IsAvailable = !newValue;
            this.toastrService.error('Failed to update availability.');
          },
        }),
    );
  }

  // ── Offer modal ────────────────────────────────────────────────

  openOfferModal(): void {
    this.isOfferModalOpen = true;
    this.selectedOfferId = null;
    this.selectedProductIds = new Set();

    if (this.offers.length === 0) {
      this.offersLoading = true;
      this.genericService
        .getObservable(OFFERS)
        .pipe(finalize(() => (this.offersLoading = false)))
        .subscribe({
          next: (res) => (this.offers = res?.data ?? []),
          error: () => this.toastrService.error('Failed to load offers'),
        });
    }
  }

  closeOfferModal(): void {
    this.isOfferModalOpen = false;
    this.selectedOfferId = null;
    this.selectedProductIds = new Set();
  }

  selectOffer(id: string): void {
    this.selectedOfferId = this.selectedOfferId === id ? null : id;
  }

  toggleProductSelect(productId: string): void {
    if (this.selectedProductIds.has(productId)) {
      this.selectedProductIds.delete(productId);
    } else {
      this.selectedProductIds.add(productId);
    }
    // trigger change detection
    this.selectedProductIds = new Set(this.selectedProductIds);
  }

  toggleSelectAll(): void {
    const selectableIds = this.availableProducts.map((p) => p._id);

    if (this.selectedProductIds.size === selectableIds.length) {
      this.selectedProductIds = new Set();
    } else {
      this.selectedProductIds = new Set(selectableIds);
    }
  }

  get availableProducts(): any[] {
    return this.orders.filter((p) => p.RemainingQuantity !== 0);
  }

  get allSelectableSelected(): boolean {
    return (
      this.availableProducts.length > 0 &&
      this.selectedProductIds.size === this.availableProducts.length
    );
  }

  applyOffer(): void {
    if (!this.selectedOfferId || this.selectedProductIds.size === 0) return;

    const payload: any = {
      OfferID: this.selectedOfferId,
      AssignProductIDs: Array.from(this.selectedProductIds),
    };

    this.isSavingOffer = true;
    this.genericService
      .putObservableToken(BULK_OFFER, payload)
      .pipe(finalize(() => (this.isSavingOffer = false)))
      .subscribe({
        next: (res) => {
          const count = res?.data?.assigned ?? this.selectedProductIds.size;
          this.toastrService.success(`Offer applied to ${count} product(s)`);
          this.closeOfferModal();
          this.reloadProducts();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to apply offer';
          this.toastrService.error(msg);
        },
      });
  }

  removeOffer(): void {
    if (this.selectedProductIds.size === 0) return;

    const payload = {
      RemoveProductIDs: Array.from(this.selectedProductIds),
    };

    this.isSavingOffer = true;
    this.genericService
      .putObservableToken(BULK_OFFER, payload)
      .pipe(finalize(() => (this.isSavingOffer = false)))
      .subscribe({
        next: (res) => {
          const count = res?.data?.removed ?? this.selectedProductIds.size;
          this.toastrService.success(`Offer removed from ${count} product(s)`);
          this.closeOfferModal();
          this.reloadProducts();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to remove offer';
          this.toastrService.error(msg);
        },
      });
  }

  productOfferName(product: any): string | null {
    return product?.Offer?.OfferName ?? null;
  }

  productOfferDiscount(product: any): number | null {
    return product?.Offer?.DiscountPercentage ?? null;
  }

  isCurrentOffer(product: any): boolean {
    return !!this.selectedOfferId && product?.Offer?._id === this.selectedOfferId;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
