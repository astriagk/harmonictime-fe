import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { adminWithdrawalAction } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { loadAdminWithdrawals } from 'src/app/store/actions/admin-withdrawals.actions';
import {
  selectAdminWithdrawals,
  selectAdminWithdrawalsLoading,
} from 'src/app/store/selectors/admin-withdrawals.selectors';

interface BankSnapshot {
  AccountHolderName: string;
  AccountNumber: string;
  IFSC: string;
  BankName: string;
}

interface Withdrawal {
  _id: string;
  SellerID: string;
  BankSnapshot: BankSnapshot;
  Amount: number;
  Status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  Reference: string | null;
  Notes: string | null;
  RequestedAt: string;
  ProcessedAt: string | null;
}

type WithdrawalFilter = 'All' | 'Pending' | 'Approved' | 'Paid' | 'Rejected';
type ModalMode = 'pay' | 'reject';

@Component({
  selector: 'app-approve-payments',
  templateUrl: './approve-payments.component.html',
  styleUrls: ['./approve-payments.component.scss'],
})
export class ApprovePaymentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  withdrawals: Withdrawal[] = [];
  paginatedWithdrawals: Withdrawal[] = [];
  paginate: any = {};
  pageSize = 10;
  pageNo = 1;
  loading = false;
  activeFilter: WithdrawalFilter = 'All';

  modalMode: ModalMode | null = null;
  selectedWithdrawal: Withdrawal | null = null;
  form!: FormGroup;
  isSaving = false;
  formError = '';

  readonly filters: WithdrawalFilter[] = ['All', 'Pending', 'Approved', 'Paid', 'Rejected'];

  constructor(
    private fb: FormBuilder,
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
        this.updatePagination();
      });

    this.store
      .select(selectAdminWithdrawalsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectAdminWithdrawals)
      .pipe(takeUntil(this.destroy$))
      .subscribe((withdrawals) => {
        this.withdrawals = withdrawals as Withdrawal[];
        this.pageNo = 1;
        this.updatePagination();
      });

    this.loadWithdrawals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // `force` bypasses the loaded/status cache guard (used after pay/reject).
  loadWithdrawals(force = false): void {
    this.store.dispatch(
      loadAdminWithdrawals({ status: this.activeFilter, force }),
    );
  }

  updatePagination(): void {
    if (!this.withdrawals.length) return;
    this.paginate = this.productService.getPager(this.withdrawals.length, this.pageNo, this.pageSize);
    this.paginatedWithdrawals = this.withdrawals.slice(this.paginate.startIndex, this.paginate.endIndex + 1);
  }

  setPage(page: number): void {
    this.pageNo = page;
    this.updatePagination();
    this.router
      .navigate([], { relativeTo: this.route, queryParams: { page }, queryParamsHandling: 'merge' })
      .finally(() => this.viewScroller.setOffset([120, 120]));
  }

  setFilter(filter: WithdrawalFilter): void {
    this.activeFilter = filter;
    this.loadWithdrawals();
  }

  openPay(withdrawal: Withdrawal): void {
    this.selectedWithdrawal = withdrawal;
    this.modalMode = 'pay';
    this.formError = '';
    this.form = this.fb.group({
      Reference: ['', Validators.required],
      Notes: [''],
    });
  }

  openReject(withdrawal: Withdrawal): void {
    this.selectedWithdrawal = withdrawal;
    this.modalMode = 'reject';
    this.formError = '';
    this.form = this.fb.group({
      Notes: ['', Validators.required],
    });
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedWithdrawal = null;
    this.formError = '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedWithdrawal || !this.modalMode) return;

    const id = this.selectedWithdrawal._id;
    const url = adminWithdrawalAction(id, this.modalMode);
    const payload = this.form.value;

    this.isSaving = true;
    this.formError = '';

    this.genericService
      .putObservableToken(url, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          const msg = this.modalMode === 'pay' ? 'Withdrawal marked as paid' : 'Withdrawal rejected';
          this.toastr.success(msg);
          this.closeModal();
          this.loadWithdrawals(true);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Something went wrong';
          this.formError = msg;
          this.toastr.error(msg);
        },
      });
  }

  canPay(w: Withdrawal): boolean {
    return w.Status === 'Pending' || w.Status === 'Approved';
  }

  canReject(w: Withdrawal): boolean {
    return w.Status === 'Pending' || w.Status === 'Approved';
  }
}
