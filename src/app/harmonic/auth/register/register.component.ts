import { Component, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { REGISTER_USER } from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import { registerUser } from 'src/app/store/actions/user.actions';
import { AppState } from 'src/app/store/app.state';
import {
  selectUserData,
  selectUserError,
} from 'src/app/store/selectors/user.selectors';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnDestroy {
  public showPassword = false;
  public showConfirmPassword = false;
  public registerForm!: FormGroup;
  public formSubmitted = false;
  public isSubmitting = false;

  private userDataSub?: Subscription;
  private userErrorSub?: Subscription;

  constructor(
    private toastrService: ToastrService,
    public genericService: GenericService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = new FormGroup(
      {
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [
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
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    const url = REGISTER_USER;
    this.formSubmitted = true;
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const payload = {
        email: formValue.email,
        password: formValue.password,
        acceptedTerms: true,
      };
      // Drop any subscriptions from a previous submit so toasts don't stack
      this.userDataSub?.unsubscribe();
      this.userErrorSub?.unsubscribe();

      this.isSubmitting = true;
      this.store.dispatch(registerUser({ url, payload }));

      // Surface the API message (e.g. "Email already registered") as a toast
      this.userErrorSub = this.store
        .select(selectUserError)
        .pipe(
          filter((error: any) => !!error),
          take(1)
        )
        .subscribe((error: any) => {
          this.isSubmitting = false;
          this.toastrService.error(this.getErrorMessage(error));
        });

      this.userDataSub = this.store
        .select(selectUserData)
        .pipe(
          filter((state: any) => !!state?.data?.token),
          take(1)
        )
        .subscribe((state: any) => {
          localStorage.setItem('token', JSON.stringify(state?.data?.token));
          this.isSubmitting = false;
          this.toastrService.success('Registration successful!');
          this.registerForm.reset();
          this.formSubmitted = false; // Reset the form submission state
          this.router.navigate(['/buyer/products']);
        });
    } else if (this.registerForm.hasError('passwordsMismatch')) {
      this.toastrService.error('Passwords do not match.');
    }
  }

  ngOnDestroy() {
    this.userDataSub?.unsubscribe();
    this.userErrorSub?.unsubscribe();
  }

  private getErrorMessage(error: any): string {
    return (
      error?.error?.message ||
      error?.message ||
      'Registration failed. Please try again.'
    );
  }
}
