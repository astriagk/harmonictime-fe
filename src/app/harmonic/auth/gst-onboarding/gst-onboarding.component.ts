import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { GST_ONBOARDING } from 'src/app/config';
import { INDIAN_STATES } from 'src/app/shared/constants/indian-states';
import { submitGst } from 'src/app/store/actions/gst.actions';
import { AppState } from 'src/app/store/app.state';
import { selectGstData, selectGstError } from 'src/app/store/selectors/gst.selectors';

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

@Component({
  selector: 'app-gst-onboarding',
  templateUrl: './gst-onboarding.component.html',
  styleUrls: ['./gst-onboarding.component.scss'],
})
export class GstOnboardingComponent implements OnInit, OnDestroy {
  gstForm!: FormGroup;
  formSubmitted = false;
  isSubmitting = false;

  readonly businessTypes = ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Other'];
  readonly indianStates = INDIAN_STATES;

  private gstDataSub?: Subscription;
  private gstErrorSub?: Subscription;

  constructor(
    private store: Store<AppState>,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.gstForm = new FormGroup({
      GSTIN: new FormControl(null, [Validators.required, Validators.pattern(GSTIN_PATTERN)]),
      LegalBusinessName: new FormControl(null, [Validators.required]),
      TradeName: new FormControl(null),
      BusinessType: new FormControl(null),
      RegisteredAddress: new FormControl(null),
      PinCode: new FormControl(null, [Validators.pattern(PINCODE_PATTERN)]),
      State: new FormControl(null),
    });
  }

  get GSTIN() { return this.gstForm.get('GSTIN'); }
  get LegalBusinessName() { return this.gstForm.get('LegalBusinessName'); }
  get PinCode() { return this.gstForm.get('PinCode'); }

  onSubmit() {
    this.formSubmitted = true;
    this.gstForm.markAllAsTouched();
    if (!this.gstForm.valid) return;

    const v = this.gstForm.value;
    const payload: Record<string, any> = {};
    Object.keys(v).forEach((k) => { if (v[k] !== null && v[k] !== '') payload[k] = v[k]; });

    this.gstDataSub?.unsubscribe();
    this.gstErrorSub?.unsubscribe();

    this.isSubmitting = true;
    this.store.dispatch(submitGst({ url: GST_ONBOARDING, payload }));

    this.gstErrorSub = this.store
      .select(selectGstError)
      .pipe(filter((error: any) => !!error), take(1))
      .subscribe((error: any) => {
        this.isSubmitting = false;
        this.toastrService.error(
          error?.error?.message || error?.message || 'Failed to submit GST details. Please try again.'
        );
      });

    this.gstDataSub = this.store
      .select(selectGstData)
      .pipe(filter((state: any) => !!state?.data), take(1))
      .subscribe(() => {
        this.isSubmitting = false;
        this.toastrService.success('GST details submitted. Pending admin verification.');
        this.gstForm.reset();
        this.formSubmitted = false;
        this.router.navigate(['/seller/products']);
      });
  }

  skip() {
    this.router.navigate(['/seller/products']);
  }

  ngOnDestroy() {
    this.gstDataSub?.unsubscribe();
    this.gstErrorSub?.unsubscribe();
  }
}
