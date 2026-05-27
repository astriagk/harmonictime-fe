import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { ADMIN_USERS, ADMIN_SELLERS, ADMIN_SELLER_BY_ID, adminUserAction, adminSellerAction } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

interface AdminUser {
  _id: string;
  email: string;
  phone: string;
  status?: 'active' | 'blocked' | 'suspended';
  dateCreated: string;
}

interface AdminSeller {
  _id: string;
  email: string;
  phone: string | null;
  accountType?: string;
  sellerVerificationStatus: 'Unverified' | 'Pending' | 'Approved' | 'Rejected';
  dateCreated: string;
  sellerVerifiedAt?: string;
  sellerVerificationNote?: string;
}

interface SellerGst {
  _id?: string;
  GSTIN?: string;
  LegalBusinessName?: string;
  TradeName?: string;
  BusinessType?: string;
  RegisteredAddress?: string;
  State?: string;
  PinCode?: string;
  IsVerified?: boolean;
}

interface SellerBankAccount {
  _id?: string;
  AccountHolderName?: string;
  AccountNumber?: string;
  IFSC?: string;
  BankName?: string;
  IsDefault?: boolean;
  IsVerified?: boolean;
  VerificationStatus?: string;
}

interface SellerProductStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface SellerProfileData {
  seller: AdminSeller;
  gst?: SellerGst | null;
  bankAccounts: SellerBankAccount[];
  products: SellerProductStats;
}

type PageView = 'customers' | 'sellers';
type StatusFilter = 'all' | 'active' | 'blocked' | 'suspended';
type SellerStatusFilter = 'all' | 'Unverified' | 'Pending' | 'Approved' | 'Rejected';
type UserAction = 'block' | 'unblock' | 'suspend';
type SellerVerifyAction = 'approve' | 'reject' | 'request-info';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  pageView: PageView = 'customers';

  // --- customers ---
  users: AdminUser[] = [];
  paginatedUsers: AdminUser[] = [];
  paginate: any = {};
  pageSize = 10;
  pageNo = 1;
  loading = false;
  activeFilter: StatusFilter = 'all';
  actionInProgress: string | null = null;
  confirmAction: { user: AdminUser; action: UserAction } | null = null;

  readonly filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Suspended', value: 'suspended' },
  ];

  // --- sellers list ---
  sellers: AdminSeller[] = [];
  paginatedSellers: AdminSeller[] = [];
  sellerPaginate: any = {};
  sellerPageNo = 1;
  sellersLoading = false;
  sellerStatusFilter: SellerStatusFilter = 'all';

  readonly sellerFilters: { label: string; value: SellerStatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unverified', value: 'Unverified' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  // --- seller profile modal ---
  sellerProfileData: SellerProfileData | null = null;
  sellerProfileLoading = false;

  // inline action state (within profile modal — no second modal needed)
  sellerPendingAction: SellerVerifyAction | null = null;
  sellerActionNote = '';
  sellerActionInProgress = false;

  constructor(
    private genericService: GenericService,
    private toastr: ToastrService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private viewScroller: ViewportScroller,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.pageNo = params['page'] ? Number(params['page']) : 1;
      this.updatePagination();
    });
    this.loadUsers();
  }

  setView(view: PageView): void {
    this.pageView = view;
    if (view === 'sellers' && this.sellers.length === 0) {
      this.loadSellers();
    }
  }

  // --- customers ---

  loadUsers(): void {
    this.loading = true;
    const url =
      this.activeFilter === 'all' ? ADMIN_USERS : `${ADMIN_USERS}?status=${this.activeFilter}`;

    this.genericService
      .getObservableToken(url)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.users = res?.data ?? [];
          this.pageNo = 1;
          this.updatePagination();
        },
        error: () => this.toastr.error('Failed to load users'),
      });
  }

  updatePagination(): void {
    if (!this.users.length) return;
    this.paginate = this.productService.getPager(this.users.length, this.pageNo, this.pageSize);
    this.paginatedUsers = this.users.slice(this.paginate.startIndex, this.paginate.endIndex + 1);
  }

  setPage(page: number): void {
    this.pageNo = page;
    this.updatePagination();
    this.router
      .navigate([], { relativeTo: this.route, queryParams: { page }, queryParamsHandling: 'merge' })
      .finally(() => this.viewScroller.setOffset([120, 120]));
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter = filter;
    this.loadUsers();
  }

  actionsFor(user: AdminUser): UserAction[] {
    const status = user.status ?? 'active';
    if (status === 'active') return ['block', 'suspend'];
    if (status === 'blocked') return ['unblock'];
    if (status === 'suspended') return ['unblock'];
    return [];
  }

  requestAction(user: AdminUser, action: UserAction): void {
    this.confirmAction = { user, action };
  }

  cancelAction(): void {
    this.confirmAction = null;
  }

  executeAction(): void {
    if (!this.confirmAction) return;
    const { user, action } = this.confirmAction;
    this.confirmAction = null;
    this.actionInProgress = user._id;

    this.genericService
      .putObservableToken(adminUserAction(user._id, action), {})
      .pipe(finalize(() => (this.actionInProgress = null)))
      .subscribe({
        next: () => {
          this.toastr.success(`User ${action}ed successfully`);
          this.loadUsers();
        },
        error: (err) => this.toastr.error(err?.error?.message ?? 'Action failed'),
      });
  }

  actionLabel(action: UserAction): string {
    return action.charAt(0).toUpperCase() + action.slice(1);
  }

  // --- sellers ---

  loadSellers(): void {
    this.sellersLoading = true;
    const url =
      this.sellerStatusFilter === 'all'
        ? ADMIN_SELLERS
        : `${ADMIN_SELLERS}?status=${this.sellerStatusFilter}`;

    this.genericService
      .getObservableToken(url)
      .pipe(finalize(() => (this.sellersLoading = false)))
      .subscribe({
        next: (res) => {
          this.sellers = res?.data ?? [];
          this.sellerPageNo = 1;
          this.updateSellerPagination();
        },
        error: () => this.toastr.error('Failed to load sellers'),
      });
  }

  updateSellerPagination(): void {
    if (!this.sellers.length) return;
    this.sellerPaginate = this.productService.getPager(this.sellers.length, this.sellerPageNo, this.pageSize);
    this.paginatedSellers = this.sellers.slice(this.sellerPaginate.startIndex, this.sellerPaginate.endIndex + 1);
  }

  setSellerPage(page: number): void {
    this.sellerPageNo = page;
    this.updateSellerPagination();
  }

  setSellerFilter(filter: SellerStatusFilter): void {
    this.sellerStatusFilter = filter;
    this.loadSellers();
  }

  openSellerProfile(listSeller: AdminSeller): void {
    // Pre-populate with list data so the modal opens immediately with known status.
    this.sellerProfileData = {
      seller: listSeller,
      gst: null,
      bankAccounts: [],
      products: { total: 0, approved: 0, pending: 0, rejected: 0 },
    };
    this.sellerPendingAction = null;
    this.sellerActionNote = '';
    this.sellerProfileLoading = true;

    this.genericService
      .getObservableToken(ADMIN_SELLER_BY_ID(listSeller._id))
      .pipe(finalize(() => (this.sellerProfileLoading = false)))
      .subscribe({
        next: (res) => {
          if (res?.data) {
            // Undefined status = newly registered, nothing submitted yet → Unverified.
            this.sellerProfileData = {
              ...res.data,
              seller: {
                ...res.data.seller,
                sellerVerificationStatus:
                  res.data.seller?.sellerVerificationStatus ??
                  listSeller.sellerVerificationStatus ??
                  'Unverified',
              },
            };
          }
        },
        error: () => {
          this.toastr.error('Failed to load seller profile');
          this.sellerProfileData = null;
        },
      });
  }

  closeSellerProfile(): void {
    this.sellerProfileData = null;
    this.sellerPendingAction = null;
    this.sellerActionNote = '';
  }

  sellerActionsFor(status: string): SellerVerifyAction[] {
    if (status === 'Pending') return ['approve', 'reject', 'request-info'];
    if (status === 'Approved') return ['reject'];
    if (status === 'Rejected') return ['approve', 'request-info'];
    return ['request-info']; // Unverified — prompt seller to complete their account
  }

  armAction(action: SellerVerifyAction): void {
    this.sellerPendingAction = action;
    this.sellerActionNote = '';
  }

  cancelPendingAction(): void {
    this.sellerPendingAction = null;
    this.sellerActionNote = '';
  }

  executeSellerAction(): void {
    if (!this.sellerPendingAction || !this.sellerProfileData) return;
    const action = this.sellerPendingAction;

    if ((action === 'reject' || action === 'request-info') && !this.sellerActionNote.trim()) {
      this.toastr.warning('Please enter a note before submitting');
      return;
    }

    this.sellerActionInProgress = true;
    const body = this.sellerActionNote.trim() ? { note: this.sellerActionNote.trim() } : {};

    this.genericService
      .putObservableToken(adminSellerAction(this.sellerProfileData.seller._id, action), body)
      .pipe(finalize(() => (this.sellerActionInProgress = false)))
      .subscribe({
        next: () => {
          const label = action === 'request-info' ? 'Info requested' : `Seller ${action}d`;
          this.toastr.success(label);
          this.closeSellerProfile();
          this.loadSellers();
        },
        error: (err) => this.toastr.error(err?.error?.message ?? 'Action failed'),
      });
  }

  sellerActionLabel(action: SellerVerifyAction): string {
    if (action === 'approve') return 'Approve';
    if (action === 'reject') return 'Reject';
    if (action === 'request-info') return 'Request Info';
    return action;
  }

  needsNote(action: SellerVerifyAction): boolean {
    return action === 'reject' || action === 'request-info';
  }

  sellerActionBtnClass(action: SellerVerifyAction): string {
    if (action === 'approve') return 'os-btn os-btn-black';
    if (action === 'reject') return 'os-btn os-btn-danger';
    return 'os-btn';
  }
}
