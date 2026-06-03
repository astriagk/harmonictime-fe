import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ADMIN_PRODUCTS, adminProductAction } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

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
export class AdminProductsComponent implements OnInit {
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
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    const url =
      this.statusFilter === 'all'
        ? ADMIN_PRODUCTS
        : `${ADMIN_PRODUCTS}?status=${this.statusFilter}`;

    this.genericService
      .getObservableToken(url)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.products = res?.data ?? [];
          this.pageNo = 1;
          this.updatePagination();
        },
        error: () => this.toastr.error('Failed to load products'),
      });
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
          this.loadProducts();
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
