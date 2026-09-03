import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BULK_OFFER, UPDATE_PRODUCT_BY_ID } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { UtilsService } from '@shared/services/utils.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ProductService } from 'src/app/shared/services/product.service';
import { loadSellerProducts } from 'src/app/store/actions/seller-products.actions';
import {
  selectSellerProducts,
  selectSellerProductsLoading,
} from 'src/app/store/selectors/seller-products.selectors';
import { loadSellerOffers } from 'src/app/store/actions/seller-offers.actions';
import {
  selectSellerOffers,
  selectSellerOffersLoading,
} from 'src/app/store/selectors/seller-offers.selectors';

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

  isOfferModalOpen = false;
  offers: Offer[] = [];
  offersLoading = false;
  selectedOfferId: string | null = null;
  selectedProductIds: Set<string> = new Set();
  isSavingOffer = false;

  // Product whose barcode label is open. Available for every product, including
  // ones still pending approval — the detail page isn't reachable for those.
  barcodeProduct: any = null;

  private destroy$ = new Subject<void>();

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
    this.store.dispatch(loadSellerProducts({}));

    this.store
      .select(selectSellerProductsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectSellerProducts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        this.orders = products;
        this.updatePagination();
      });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.pageNo = params['page'] ? Number(params['page']) : this.pageNo;
      this.updatePagination();
    });

    this.store
      .select(selectSellerOffers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((offers) => (this.offers = offers as Offer[]));
    this.store
      .select(selectSellerOffersLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.offersLoading = loading));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      .finally(() => this.viewScroller.setOffset([120, 120]));
  }

  toggleAvailability(product: any, event: Event): void {
    event.stopPropagation();
    const newValue = !product.IsAvailable;
    this.genericService
      .putObservable(`${UPDATE_PRODUCT_BY_ID}${product._id}`, { IsAvailable: newValue })
      .subscribe({
        next: () => {
          this.toastrService.success(
            newValue ? 'Product marked available.' : 'Product marked unavailable.',
          );
          this.store.dispatch(loadSellerProducts({ force: true }));
        },
        error: () => this.toastrService.error('Failed to update availability.'),
      });
  }

  openOfferModal(): void {
    this.isOfferModalOpen = true;
    this.selectedOfferId = null;
    this.selectedProductIds = new Set();
    // The slice's loaded-guard fetches once and serves cache on later opens.
    this.store.dispatch(loadSellerOffers({}));
  }

  openBarcodeModal(product: any): void {
    this.barcodeProduct = product;
  }

  closeBarcodeModal(): void {
    this.barcodeProduct = null;
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
          this.store.dispatch(loadSellerProducts({ force: true }));
        },
        error: (err) => this.toastrService.error(err?.error?.message ?? 'Failed to apply offer'),
      });
  }

  removeOffer(): void {
    if (this.selectedProductIds.size === 0) return;
    const payload = { RemoveProductIDs: Array.from(this.selectedProductIds) };
    this.isSavingOffer = true;
    this.genericService
      .putObservableToken(BULK_OFFER, payload)
      .pipe(finalize(() => (this.isSavingOffer = false)))
      .subscribe({
        next: (res) => {
          const count = res?.data?.removed ?? this.selectedProductIds.size;
          this.toastrService.success(`Offer removed from ${count} product(s)`);
          this.closeOfferModal();
          this.store.dispatch(loadSellerProducts({ force: true }));
        },
        error: (err) => this.toastrService.error(err?.error?.message ?? 'Failed to remove offer'),
      });
  }

  // Details page only exists for approved products that are still in stock.
  // In-review / rejected products would 404 — the seller edits them instead.
  // Status casing can vary by endpoint, so compare case-insensitively.
  canViewDetails(product: any): boolean {
    const status = (product?.ApprovalStatus ?? '').toString().trim().toLowerCase();
    return status === 'approved' && product?.RemainingQuantity !== 0;
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
}
