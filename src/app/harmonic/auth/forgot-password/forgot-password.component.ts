import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VERIFY_EMAIL } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  public forgotPassword!: FormGroup;
  public formSubmitted = false;
  public isSubmitting = false;
  public emailSent = false;

  constructor(
    private toastrService: ToastrService,
    public genericService: GenericService
  ) {}

  ngOnInit() {
    this.forgotPassword = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
    });
  }

  get email() {
    return this.forgotPassword.get('email');
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.forgotPassword.invalid || this.isSubmitting) {
      return;
    }

    const payload = { email: this.forgotPassword.value.email };
    this.isSubmitting = true;

    this.genericService.postObservable(VERIFY_EMAIL, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.emailSent = true;
        this.toastrService.success(
          'We have emailed you an OTP to reset your password.'
        );
      },
      error: (err) => {
        this.isSubmitting = false;
        const message =
          err?.error?.message || 'Could not send the reset email. Please try again.';
        this.toastrService.error(message);
      },
    });
  }
}
