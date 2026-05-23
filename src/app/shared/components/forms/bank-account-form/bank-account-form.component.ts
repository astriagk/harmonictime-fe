import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Reusable bank account (payout destination) form. Presentational only: it owns
 * the form + validation and emits a normalized payload on save; the parent
 * performs the create/update API call (POST/PUT /bank-accounts). Mirrors the
 * address-form pattern. Validation matches the wallet API (spec §3.1):
 * AccountNumber 6–18 digits, IFSC = 4 letters + 0 + 6 alphanumerics.
 */
@Component({
  selector: 'app-bank-account-form',
  templateUrl: './bank-account-form.component.html',
  styleUrls: ['./bank-account-form.component.scss'],
})
export class BankAccountFormComponent implements OnChanges {
  // Existing account to edit; null/undefined for a new account.
  @Input() account: any = null;
  // Parent-controlled flag so the submit button can show a saving state.
  @Input() saving = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  public bankForm!: FormGroup;
  public formSubmitted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['account'] || !this.bankForm) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const a = this.account ?? {};
    this.formSubmitted = false;
    this.bankForm = new FormGroup({
      accountHolderName: new FormControl(
        a.AccountHolderName ?? null,
        Validators.required
      ),
      accountNumber: new FormControl(a.AccountNumber ?? null, [
        Validators.required,
        Validators.pattern(/^\d{6,18}$/),
      ]),
      ifsc: new FormControl(a.IFSC ?? null, [
        Validators.required,
        Validators.pattern(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/),
      ]),
      bankName: new FormControl(a.BankName ?? null, Validators.required),
      isDefault: new FormControl(a.IsDefault ?? false),
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (!this.bankForm.valid || this.saving) {
      return;
    }

    const v = this.bankForm.value;
    // Emit in the PascalCase shape the bank-accounts API expects (spec §3.1).
    this.save.emit({
      AccountHolderName: v.accountHolderName?.trim(),
      AccountNumber: v.accountNumber?.trim(),
      IFSC: v.ifsc?.trim().toUpperCase(), // uppercased server-side too
      BankName: v.bankName?.trim(),
      IsDefault: !!v.isDefault,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get accountHolderName() {
    return this.bankForm.get('accountHolderName');
  }
  get accountNumber() {
    return this.bankForm.get('accountNumber');
  }
  get ifsc() {
    return this.bankForm.get('ifsc');
  }
  get bankName() {
    return this.bankForm.get('bankName');
  }
}
