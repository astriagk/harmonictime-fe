import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { adminProductAction } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { loadAdminProducts } from 'src/app/store/actions/admin-products.actions';
import {
  selectAdminProducts,
  selectAdminProductsLoading,
} from 'src/app/store/selectors/admin-products.selectors';

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
type ProductAction = 'approve' | 'reject';

interface AdminProduct {
  _id: string;
  UserID: string;
  ProductName: string;
  Price: number;
  DisplayPrice?: number;
  IsPriceInclusiveOfTax?: boolean;
  ApprovalStatus: ApprovalStatus;
  ApprovalNote?: string;
  ApprovedAt?: string;
  DateListed?: string;
  Quantity?: number;
  RemainingQuantity?: number;
  IsAvailable?: boolean;
  Status?: string;
  SoldCount?: number;
  IsSold?: boolean;
  Offer?: {
    _id: string;
    OfferName: string;
    Description?: string;
    DiscountPercentage: number;
    StartDate: string;
    EndDate: string;
    IsActive: boolean;
  };
  Images?: { ImageURL: string; IsPrimary: boolean; mediaType: string }[];
  Details?: {
    BrandName?: string;
    CategoryName?: string;
    CollectionName?: string;
    RecipientName?: string;
    MovementName?: string;
    StrapMaterialName?: string;
    CaseMaterialName?: string;
    DialColorName?: string;
    WatchMarkerName?: string;
    Diameter?: string;
    WaterResistant?: string;
    Guarantee?: string;
    ManufacturerProductNumber?: string;
    DeliveryOptionName?: string;
  };
  Description?: { Title?: string; Content?: string; AdditionalDetails?: string };
  DeliveryAndReturns?: { DeliveryInformation?: string; ReturnsPolicy?: string };
}

@Component({
  selector: 'app-admin-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  products: AdminProduct[] = [];
  paginated: AdminProduct[] = [];
  paginate: any = {};
  pageNo = 1;
  readonly pageSize = 10;
  loading = false;

  statusFilter: ApprovalStatus | 'all' = 'Pending';

  readonly filters: { label: string; value: ApprovalStatus | 'all' }[] = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'All', value: 'all' },
  ];

  selectedProduct: AdminProduct | null = null;
  pendingAction: ProductAction | null = null;
  actionNote = '';
  actionInProgress = false;

  constructor(
    private genericService: GenericService,
    private toastr: ToastrService,
    private productService: ProductService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectAdminProductsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectAdminProducts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        this.products = products as AdminProduct[];
        this.pageNo = 1;
        this.updatePagination();
      });

    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // `force` bypasses the loaded/status cache guard (used after approve/reject).
  loadProducts(force = false): void {
    this.store.dispatch(
      loadAdminProducts({ status: this.statusFilter, force }),
    );
  }

  setFilter(filter: ApprovalStatus | 'all'): void {
    this.statusFilter = filter;
    this.loadProducts();
  }

  updatePagination(): void {
    if (!this.products.length) return;
    this.paginate = this.productService.getPager(
      this.products.length,
      this.pageNo,
      this.pageSize,
    );
    this.paginated = this.products.slice(
      this.paginate.startIndex,
      this.paginate.endIndex + 1,
    );
  }

  setPage(page: number): void {
    this.pageNo = page;
    this.updatePagination();
  }

  openProduct(product: AdminProduct): void {
    this.selectedProduct = product;
    this.pendingAction = null;
    this.actionNote = '';
  }

  closeProduct(): void {
    this.selectedProduct = null;
    this.pendingAction = null;
    this.actionNote = '';
  }

  primaryImage(product: AdminProduct): string | null {
    const imgs = product.Images ?? [];
    return (
      imgs.find((i) => i.IsPrimary && i.mediaType === 'image')?.ImageURL ??
      imgs.find((i) => i.mediaType === 'image')?.ImageURL ??
      null
    );
  }

  allMedia(product: AdminProduct): { ImageURL: string; IsPrimary: boolean; mediaType: string }[] {
    return [...(product.Images ?? [])].sort((a, b) => {
      const aIsVideo = a.mediaType === 'video';
      const bIsVideo = b.mediaType === 'video';
      if (aIsVideo !== bIsVideo) return aIsVideo ? 1 : -1;
      return (b.IsPrimary ? 1 : 0) - (a.IsPrimary ? 1 : 0);
    });
  }

  actionsFor(status: ApprovalStatus): ProductAction[] {
    if (status === 'Pending') return ['approve', 'reject'];
    if (status === 'Approved') return ['reject'];
    if (status === 'Rejected') return ['approve'];
    return [];
  }

  armAction(action: ProductAction): void {
    this.pendingAction = action;
    this.actionNote = '';
  }

  cancelAction(): void {
    this.pendingAction = null;
    this.actionNote = '';
  }

  executeAction(): void {
    if (!this.pendingAction || !this.selectedProduct) return;

    if (this.pendingAction === 'reject' && !this.actionNote.trim()) {
      this.toastr.warning('Please enter a rejection reason');
      return;
    }

    this.actionInProgress = true;
    const body = this.actionNote.trim() ? { note: this.actionNote.trim() } : {};

    this.genericService
      .putObservableToken(
        adminProductAction(this.selectedProduct._id, this.pendingAction),
        body,
      )
      .pipe(finalize(() => (this.actionInProgress = false)))
      .subscribe({
        next: () => {
          this.toastr.success(
            this.pendingAction === 'approve' ? 'Product approved' : 'Product rejected',
          );
          this.closeProduct();
          this.loadProducts(true);
        },
        error: (err) => this.toastr.error(err?.error?.message ?? 'Action failed'),
      });
  }

  actionLabel(action: ProductAction): string {
    return action === 'approve' ? 'Approve' : 'Reject';
  }

  actionBtnClass(action: ProductAction): string {
    return action === 'approve' ? 'os-btn os-btn-black' : 'os-btn os-btn-danger';
  }

  badgeClass(status: ApprovalStatus): string {
    if (status === 'Approved') return 'admin-status-badge--seller-approved';
    if (status === 'Rejected') return 'admin-status-badge--seller-rejected';
    return 'admin-status-badge--seller-pending';
  }
}
