import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { ADMIN_USERS, adminUserAction } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

interface AdminUser {
  _id: string;
  email: string;
  phone: string;
  status?: 'active' | 'blocked' | 'suspended';
  dateCreated: string;
}

type StatusFilter = 'all' | 'active' | 'blocked' | 'suspended';
type UserAction = 'block' | 'unblock' | 'suspend';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
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

  loadUsers(): void {
    this.loading = true;
    const url =
      this.activeFilter === 'all'
        ? ADMIN_USERS
        : `${ADMIN_USERS}?status=${this.activeFilter}`;

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
        error: (err) => {
          const msg = err?.error?.message ?? 'Action failed';
          this.toastr.error(msg);
        },
      });
  }

  actionLabel(action: UserAction): string {
    return action.charAt(0).toUpperCase() + action.slice(1);
  }
}
