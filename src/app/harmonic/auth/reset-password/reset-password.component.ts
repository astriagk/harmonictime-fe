import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RESET_PASSWORD } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  public resetForm!: FormGroup;
  public formSubmitted = false;
  public isSubmitting = false;
  public showPassword = false;
  public showConfirmPassword = false;
  private token: string | null = null;

  constructor(
    private toastrService: ToastrService,
    public genericService: GenericService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // The reset link is reset-password?token=<signed-jwt>; keep the token to
    // send back in the payload. If the OTP is also passed, prefill it.
    this.token = this.route.snapshot.queryParamMap.get('token');
    const otpFromLink = this.route.snapshot.queryParamMap.get('otp');

    if (!this.token) {
      this.toastrService.error(
        'This reset link is invalid or has expired. Please request a new one.'
      );
    }

    this.resetForm = new FormGroup(
      {
        otp: new FormControl(otpFromLink, [Validators.required]),
        newPassword: new FormControl(null, [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{6,}$'
          ),
        ]),
        confirmPassword: new FormControl(null, [Validators.required]),
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  get otp() {
    return this.resetForm.get('otp');
  }
  get newPassword() {
    return this.resetForm.get('newPassword');
  }
  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  togglePasswordVisibility(field: 'newPassword' | 'confirmPassword') {
    if (field === 'newPassword') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.resetForm.hasError('passwordsMismatch')) {
      this.toastrService.error('Passwords do not match.');
      return;
    }
    if (this.resetForm.invalid || this.isSubmitting) {
      return;
    }

    const payload = {
      token: this.token,
      otp: this.resetForm.value.otp,
      newPassword: this.resetForm.value.newPassword,
    };
    this.isSubmitting = true;

    this.genericService.postObservable(RESET_PASSWORD, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastrService.success(
          'Password reset successful! Please log in.'
        );
        this.resetForm.reset();
        this.formSubmitted = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastrService.error(
          'Could not reset your password. Check the OTP and try again.'
        );
      },
    });
  }
}
