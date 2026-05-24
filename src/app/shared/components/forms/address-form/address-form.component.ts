import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { countries } from '@shared/constants/countries';

/**
 * Reusable address form (the former checkout "Billing Details" fields).
 * Presentational only: it owns the form + validation and emits a normalized
 * Address payload on save; the parent performs the create/update API call. Used
 * by the account Address tab (add/edit) and available for reuse elsewhere.
 */
@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent implements OnChanges {
  // Existing address to edit; null/undefined for a new address.
  @Input() address: any = null;
  // Parent-controlled flag so the submit button can show a saving state.
  @Input() saving = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  public countries = countries;
  public addressForm!: FormGroup;
  public formSubmitted = false;

  ngOnChanges(changes: SimpleChanges): void {
    // Rebuild whenever a (different) address is passed in so edit pre-fills and
    // add starts blank.
    if (changes['address'] || !this.addressForm) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const a = this.address ?? {};
    this.formSubmitted = false;
    this.addressForm = new FormGroup({
      firstName: new FormControl(a.FirstName ?? null, Validators.required),
      lastName: new FormControl(a.LastName ?? null, Validators.required),
      country: new FormControl(a.Country ?? 'India', Validators.required),
      address: new FormControl(a.AddressLine1 ?? null, Validators.required),
      apartment: new FormControl(a.AddressLine2 ?? null),
      city: new FormControl(a.City ?? null, Validators.required),
      state: new FormControl(a.State ?? null, Validators.required),
      zipCode: new FormControl(a.PostalCode ?? null, Validators.required),
      phone: new FormControl(a.Phone ?? null, Validators.required),
      isDefault: new FormControl(a.IsDefault ?? false),
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (!this.addressForm.valid || this.saving) {
      return;
    }

    const v = this.addressForm.value;
    // Emit in the PascalCase shape the address API expects (matches the
    // create-order address payload in checkout).
    this.save.emit({
      FirstName: v.firstName,
      LastName: v.lastName,
      Country: v.country,
      AddressLine1: v.address,
      AddressLine2: v.apartment ?? '',
      City: v.city,
      State: v.state,
      PostalCode: v.zipCode,
      Phone: v.phone,
      IsDefault: !!v.isDefault,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get firstName() {
    return this.addressForm.get('firstName');
  }
  get lastName() {
    return this.addressForm.get('lastName');
  }
  get country() {
    return this.addressForm.get('country');
  }
  get address2() {
    return this.addressForm.get('address');
  }
  get city() {
    return this.addressForm.get('city');
  }
  get state() {
    return this.addressForm.get('state');
  }
  get zipCode() {
    return this.addressForm.get('zipCode');
  }
  get phone() {
    return this.addressForm.get('phone');
  }
}
