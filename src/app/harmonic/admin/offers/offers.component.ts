import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { OFFERS, OFFER_BY_ID, OFFER_STATUS } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { loadAdminOffers, reloadAdminOffers, upsertAdminOffer } from 'src/app/store/actions/admin-offers.actions';
import {
  selectAdminOffers,
  selectAdminOffersLoading,
} from 'src/app/store/selectors/admin-offers.selectors';

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
  selector: 'app-admin-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class AdminOffersComponent implements OnInit, OnDestroy {
  offers: Offer[] = [];
  paginationOffers: Offer[] = [];
  paginate: any = {};
  pageSize = 10;
  pageNo = 1;
  loading = false;

  isModalOpen = false;
  editingOffer: Offer | null = null;
  isSaving = false;
  isDeleting: string | null = null;

  form!: FormGroup;
  formError = '';

  confirmDeleteId: string | null = null;
  confirmDeleteName = '';

  private destroy$ = new Subject<void>();

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
    this.initForm();

    this.store.dispatch(loadAdminOffers());

    this.store
      .select(selectAdminOffersLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectAdminOffers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((offers) => {
        this.offers = offers as Offer[];
        this.updatePagination();
      });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.pageNo = params['page'] ? Number(params['page']) : 1;
      this.updatePagination();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(offer?: Offer): void {
    this.form = this.fb.group({
      OfferName: [offer?.OfferName ?? '', Validators.required],
      Description: [offer?.Description ?? ''],
      DiscountPercentage: [
        offer?.DiscountPercentage ?? null,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      StartDate: [offer ? this.toDateInput(offer.StartDate) : '', Validators.required],
      EndDate: [offer ? this.toDateInput(offer.EndDate) : '', Validators.required],
      IsActive: [offer?.IsActive ?? true],
    });
  }

  updatePagination(): void {
    if (!this.offers.length) return;
    this.paginate = this.productService.getPager(
      this.offers.length,
      this.pageNo,
      this.pageSize,
    );
    this.paginationOffers = this.offers.slice(
      this.paginate.startIndex,
      this.paginate.endIndex + 1,
    );
  }

  setPage(page: number): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge',
      })
      .finally(() => this.viewScroller.setOffset([120, 120]));
  }

  openCreate(): void {
    this.editingOffer = null;
    this.formError = '';
    this.initForm();
    this.isModalOpen = true;
  }

  openEdit(offer: Offer): void {
    this.editingOffer = offer;
    this.formError = '';
    this.initForm(offer);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingOffer = null;
    this.formError = '';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.form.value,
      StartDate: new Date(this.form.value.StartDate).toISOString(),
      EndDate: new Date(this.form.value.EndDate).toISOString(),
    };
    this.isSaving = true;
    this.formError = '';
    const request$ = this.editingOffer
      ? this.genericService.putObservable(`${OFFER_BY_ID}${this.editingOffer._id}`, payload)
      : this.genericService.postObservable(OFFERS, payload);

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.toastr.success(this.editingOffer ? 'Offer updated successfully' : 'Offer created successfully');
        this.closeModal();
        this.store.dispatch(reloadAdminOffers());
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong';
        this.formError = msg;
        this.toastr.error(msg);
      },
    });
  }

  toggleStatus(offer: Offer): void {
    const newStatus = !offer.IsActive;
    this.genericService
      .patchObservable(OFFER_STATUS(offer._id), { IsActive: newStatus })
      .subscribe({
        next: () => {
          this.store.dispatch(
            upsertAdminOffer({ offer: { ...offer, IsActive: newStatus } }),
          );
          this.toastr.success(newStatus ? 'Offer enabled' : 'Offer disabled');
        },
        error: () => this.toastr.error('Failed to update offer status'),
      });
  }

  requestDelete(offer: Offer): void {
    this.confirmDeleteId = offer._id;
    this.confirmDeleteName = offer.OfferName;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
    this.confirmDeleteName = '';
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId;
    if (!id) return;
    this.isDeleting = id;
    this.cancelDelete();
    this.genericService
      .deleteObservable(`${OFFER_BY_ID}${id}`)
      .pipe(finalize(() => (this.isDeleting = null)))
      .subscribe({
        next: () => {
          this.toastr.success('Offer deleted');
          this.store.dispatch(reloadAdminOffers());
        },
        error: () => this.toastr.error('Failed to delete offer'),
      });
  }

  private toDateInput(isoDate: string): string {
    return isoDate ? isoDate.substring(0, 10) : '';
  }
}
