import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from 'src/app/shared/services/generic.service';
import { RESEND_VERIFICATION, UPDATE_UNVERIFIED_EMAIL } from 'src/app/config';

export type CheckEmailReason = 'pending' | 'unverified' | 'expired';

@Component({
  selector: 'app-check-email',
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.scss'],
})
export class CheckEmailComponent implements OnInit {
  public reason: CheckEmailReason = 'pending';
  public email = '';
  public isResending = false;
  public resendDone = false;
  public updatedEmail = '';

  // only for expired case — editable email input
  public expiredForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private genericService: GenericService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    const reason = this.route.snapshot.queryParamMap.get('reason') as CheckEmailReason;
    this.reason = reason ?? 'pending';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    this.expiredForm = new FormGroup({
      email: new FormControl(this.email, [Validators.required, Validators.email]),
    });
  }

  get expiredEmailCtrl() { return this.expiredForm.get('email'); }

  // Button-only resend for unverified (email already known from query param)
  resend() {
    this.isResending = true;
    this.genericService.postObservable(RESEND_VERIFICATION, { email: this.email }).subscribe({
      next: () => { this.isResending = false; this.resendDone = true; },
      error: (err: any) => {
        this.isResending = false;
        this.toastrService.error(err?.error?.message ?? 'Failed to resend. Please try again.');
      },
    });
  }

  // Expired resend — calls update-unverified-email if address changed, resend otherwise
  resendExpired() {
    if (this.expiredForm.invalid) {
      this.expiredForm.markAllAsTouched();
      return;
    }
    const newEmail: string = this.expiredForm.value.email.trim();
    this.isResending = true;

    if (newEmail === this.email) {
      this.genericService.postObservable(RESEND_VERIFICATION, { email: newEmail }).subscribe({
        next: () => {
          this.isResending = false;
          this.updatedEmail = newEmail;
          this.resendDone = true;
        },
        error: (err: any) => {
          this.isResending = false;
          this.toastrService.error(err?.error?.message ?? 'Failed to resend. Please try again.');
        },
      });
    } else {
      this.genericService
        .postObservable(UPDATE_UNVERIFIED_EMAIL, { currentEmail: this.email, newEmail })
        .subscribe({
          next: () => {
            this.isResending = false;
            this.updatedEmail = newEmail;
            this.resendDone = true;
          },
          error: (err: any) => {
            this.isResending = false;
            this.toastrService.error(err?.error?.message ?? 'Failed to update email. Please try again.');
          },
        });
    }
  }
}
