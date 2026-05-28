import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { INDIAN_STATES } from '@shared/constants/indian-states';

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

@Component({
  selector: 'app-gst-form',
  templateUrl: './gst-form.component.html',
  styleUrls: ['./gst-form.component.scss'],
})
export class GstFormComponent implements OnChanges {
  @Input() gst: any = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  gstForm!: FormGroup;
  formSubmitted = false;

  readonly businessTypes = ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Other'];
  readonly indianStates = INDIAN_STATES;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gst'] || !this.gstForm) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const g = this.gst ?? {};
    this.formSubmitted = false;
    this.gstForm = new FormGroup({
      GSTIN: new FormControl(g.GSTIN ?? null, [Validators.required, Validators.pattern(GSTIN_PATTERN)]),
      LegalBusinessName: new FormControl(g.LegalBusinessName ?? null, [Validators.required]),
      TradeName: new FormControl(g.TradeName ?? null),
      BusinessType: new FormControl(g.BusinessType ?? null),
      RegisteredAddress: new FormControl(g.RegisteredAddress ?? null),
      PinCode: new FormControl(g.PinCode ?? null, [Validators.pattern(PINCODE_PATTERN)]),
      State: new FormControl(g.State ?? null),
    });
  }

  get GSTIN() { return this.gstForm.get('GSTIN'); }
  get LegalBusinessName() { return this.gstForm.get('LegalBusinessName'); }
  get PinCode() { return this.gstForm.get('PinCode'); }

  onSubmit(): void {
    this.formSubmitted = true;
    this.gstForm.markAllAsTouched();
    if (!this.gstForm.valid || this.saving) return;

    const v = this.gstForm.value;
    const payload: Record<string, any> = {};
    Object.keys(v).forEach((k) => { if (v[k] !== null && v[k] !== '') payload[k] = v[k]; });
    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
