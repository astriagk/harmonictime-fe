import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { ADMIN_WITHDRAWALS, adminWithdrawalAction } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

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
export class ApprovePaymentsComponent implements OnInit {
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
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.pageNo = params['page'] ? Number(params['page']) : 1;
      this.updatePagination();
    });
    this.loadWithdrawals();
  }

  loadWithdrawals(): void {
    this.loading = true;
    const url =
      this.activeFilter === 'All'
        ? ADMIN_WITHDRAWALS
        : `${ADMIN_WITHDRAWALS}?status=${this.activeFilter}`;

    this.genericService
      .getObservableToken(url)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.withdrawals = res?.data ?? [];
          this.pageNo = 1;
          this.updatePagination();
        },
        error: () => this.toastr.error('Failed to load withdrawals'),
      });
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
          this.loadWithdrawals();
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
