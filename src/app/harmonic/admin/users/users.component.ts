import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ADMIN_USER_BY_ID, adminUserAction, adminSellerAction } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { loadAdminUsers } from 'src/app/store/actions/admin-users.actions';
import {
  selectAdminUsers,
  selectAdminUsersLoading,
} from 'src/app/store/selectors/admin-users.selectors';

interface AdminUser {
  _id: string;
  email: string;
  phone: string | null;
  status: 'active' | 'blocked' | 'suspended';
  dateCreated: string;
  roles: string[];
  accountType: string | null;
  businessName: string | null;
  sellerVerificationStatus: string | null;
  sellerVerificationNote: string | null;
  sellerVerifiedAt: string | null;
  sellerVerifiedBy: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePicUrl: string | null;
}

interface GstDocument {
  url: string;
  key: string;
  documentType: string;
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
  Documents?: GstDocument[];
  CreatedAt?: string;
  UpdatedAt?: string;
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
  VerifiedName?: string;
  VerifiedAt?: string;
}

interface UserDetailData {
  user: AdminUser;
  roles: { roleId: number; roleName: string }[];
  gst: SellerGst | null;
  bankAccounts: SellerBankAccount[];
}

type PageView = 'customers' | 'sellers';
type StatusFilter = 'all' | 'active' | 'blocked' | 'suspended';
type SellerStatusFilter = 'all' | 'Unverified' | 'Pending' | 'Resubmitted' | 'Approved' | 'Rejected';
type UserAction = 'block' | 'unblock' | 'suspend';
type SellerVerifyAction = 'approve' | 'reject' | 'request-info';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  pageView: PageView = 'customers';

  // raw cache from single API call
  private allUsersCache: AdminUser[] = [];
  listLoading = false;

  // --- customers ---
  users: AdminUser[] = [];
  paginatedUsers: AdminUser[] = [];
  paginate: any = {};
  pageSize = 10;
  pageNo = 1;
  activeFilter: StatusFilter = 'all';
  actionInProgress: string | null = null;
  confirmAction: { user: AdminUser; action: UserAction } | null = null;

  readonly filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Suspended', value: 'suspended' },
  ];

  // --- sellers ---
  sellers: AdminUser[] = [];
  paginatedSellers: AdminUser[] = [];
  sellerPaginate: any = {};
  sellerPageNo = 1;
  sellerStatusFilter: SellerStatusFilter = 'all';

  readonly sellerFilters: { label: string; value: SellerStatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unverified', value: 'Unverified' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Resubmitted', value: 'Resubmitted' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  // --- user detail modal (customers) ---
  selectedUserDetail: UserDetailData | null = null;
  userDetailLoading = false;

  // --- seller profile modal ---
  sellerDetail: UserDetailData | null = null;
  sellerProfileLoading = false;
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
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.pageNo = params['page'] ? Number(params['page']) : 1;
      });

    this.store
      .select(selectAdminUsersLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.listLoading = loading));

    this.store
      .select(selectAdminUsers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.allUsersCache = users as AdminUser[];
        this.applyFilters();
      });

    this.loadAllUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setView(view: PageView): void {
    this.pageView = view;
  }

  // --- load + filter ---

  // `force` bypasses the loaded-cache guard (used after admin user mutations).
  loadAllUsers(force = false): void {
    this.store.dispatch(loadAdminUsers({ force }));
  }

  private applyFilters(): void {
    const allSellers = this.allUsersCache.filter((u) => u.accountType === 'business');
    const allCustomers = this.allUsersCache.filter((u) => u.accountType !== 'business');

    this.users =
      this.activeFilter === 'all'
        ? allCustomers
        : allCustomers.filter((u) => u.status === this.activeFilter);

    this.sellers =
      this.sellerStatusFilter === 'all'
        ? allSellers
        : allSellers.filter((u) => u.sellerVerificationStatus === this.sellerStatusFilter);

    this.pageNo = 1;
    this.sellerPageNo = 1;
    this.updatePagination();
    this.updateSellerPagination();
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  setSellerFilter(filter: SellerStatusFilter): void {
    this.sellerStatusFilter = filter;
    this.applyFilters();
  }

  // --- customer pagination ---

  updatePagination(): void {
    if (!this.users.length) { this.paginate = {}; this.paginatedUsers = []; return; }
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

  // --- seller pagination ---

  updateSellerPagination(): void {
    if (!this.sellers.length) { this.sellerPaginate = {}; this.paginatedSellers = []; return; }
    this.sellerPaginate = this.productService.getPager(this.sellers.length, this.sellerPageNo, this.pageSize);
    this.paginatedSellers = this.sellers.slice(this.sellerPaginate.startIndex, this.sellerPaginate.endIndex + 1);
  }

  setSellerPage(page: number): void {
    this.sellerPageNo = page;
    this.updateSellerPagination();
  }

  // --- customer actions ---

  actionsFor(user: AdminUser): UserAction[] {
    const status = user.status ?? 'active';
    if (status === 'active') return ['block', 'suspend'];
    if (status === 'blocked' || status === 'suspended') return ['unblock'];
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
          // Re-fetch from the source of truth (the slice owns the list now).
          this.loadAllUsers(true);
        },
        error: (err) => this.toastr.error(err?.error?.message ?? 'Action failed'),
      });
  }

  actionLabel(action: UserAction): string {
    return action.charAt(0).toUpperCase() + action.slice(1);
  }

  // --- customer detail modal ---

  openUserDetail(user: AdminUser): void {
    this.selectedUserDetail = { user, roles: [], gst: null, bankAccounts: [] };
    this.userDetailLoading = true;

    this.genericService
      .getObservableToken(ADMIN_USER_BY_ID + user._id)
      .pipe(finalize(() => (this.userDetailLoading = false)))
      .subscribe({
        next: (res) => {
          if (res?.data) this.selectedUserDetail = res.data as UserDetailData;
        },
        error: () => this.toastr.error('Failed to load user details'),
      });
  }

  closeUserDetail(): void {
    this.selectedUserDetail = null;
  }

  // --- seller profile modal ---

  openSellerProfile(listSeller: AdminUser): void {
    this.sellerDetail = { user: listSeller, roles: [], gst: null, bankAccounts: [] };
    this.sellerPendingAction = null;
    this.sellerActionNote = '';
    this.sellerProfileLoading = true;

    this.genericService
      .getObservableToken(ADMIN_USER_BY_ID + listSeller._id)
      .pipe(finalize(() => (this.sellerProfileLoading = false)))
      .subscribe({
        next: (res) => {
          if (res?.data) {
            this.sellerDetail = {
              ...(res.data as UserDetailData),
              user: {
                ...(res.data.user as AdminUser),
                sellerVerificationStatus:
                  res.data.user?.sellerVerificationStatus ??
                  listSeller.sellerVerificationStatus ??
                  'Unverified',
              },
            };
          }
        },
        error: () => {
          this.toastr.error('Failed to load seller profile');
          this.sellerDetail = null;
        },
      });
  }

  closeSellerProfile(): void {
    this.sellerDetail = null;
    this.sellerPendingAction = null;
    this.sellerActionNote = '';
  }

  sellerActionsFor(status: string | null): SellerVerifyAction[] {
    if (status === 'Pending' || status === 'Resubmitted') return ['approve', 'reject', 'request-info'];
    if (status === 'Approved') return ['reject'];
    if (status === 'Rejected') return ['approve', 'request-info'];
    return ['request-info'];
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
    if (!this.sellerPendingAction || !this.sellerDetail) return;
    const action = this.sellerPendingAction;

    if ((action === 'reject' || action === 'request-info') && !this.sellerActionNote.trim()) {
      this.toastr.warning('Please enter a note before submitting');
      return;
    }

    this.sellerActionInProgress = true;
    const body = this.sellerActionNote.trim() ? { note: this.sellerActionNote.trim() } : {};

    this.genericService
      .putObservableToken(adminSellerAction(this.sellerDetail.user._id, action), body)
      .pipe(finalize(() => (this.sellerActionInProgress = false)))
      .subscribe({
        next: () => {
          const label = action === 'request-info' ? 'Info requested' : `Seller ${action}d`;
          this.toastr.success(label);
          this.closeSellerProfile();
          this.loadAllUsers(true);
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

  docTypeLabel(type: string): string {
    const map: Record<string, string> = {
      GSTCertificate: 'GST Certificate',
      AddressProof: 'Address Proof',
      PANCard: 'PAN Card',
      CancelledCheque: 'Cancelled Cheque',
      BankStatement: 'Bank Statement',
      Other: 'Other',
    };
    return map[type] ?? type;
  }
}
