import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { REGISTER_USER } from '@config/index';
import { Store } from '@ngrx/store';
import { GenericService } from '@shared/services/generic.service';
import { ToastrService } from 'ngx-toastr';
import { registerUser } from 'src/app/store/actions/user.actions';
import { AppState } from 'src/app/store/app.state';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  public showPassword = false;
  public showCurrentPassword = false;
  public showConfirmPassword = false;
  public forgotPassword!: FormGroup;
  public formSubmitted = false;

  constructor(
    private toastrService: ToastrService,
    public genericService: GenericService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  ngOnInit() {
    this.forgotPassword = new FormGroup(
      {
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$'
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
    return this.forgotPassword.get('email');
  }
  get password() {
    return this.forgotPassword.get('password');
  }
  get confirmPassword() {
    return this.forgotPassword.get('confirmPassword');
  }

  togglePasswordVisibility(field: string) {
    if (field === 'showCurrentPassword') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    const url = REGISTER_USER;
    this.formSubmitted = true;
    if (this.forgotPassword.valid) {
      const formValue = this.forgotPassword.value;
      const payload = {
        email: formValue.email,
        password: formValue.password,
      };
      this.store.dispatch(registerUser({ url, payload }));
      this.store.select(selectUserData).subscribe((state: any) => {
        if (state && state?.data?.token) {
          localStorage.setItem('token', JSON.stringify(state?.data?.token));
          this.toastrService.success('Registration successful!');
          this.forgotPassword.reset();
          this.formSubmitted = false; // Reset the form submission state
          this.router.navigate(['/buyer/products']);
        }
      });
    } else if (this.forgotPassword.hasError('passwordsMismatch')) {
      this.toastrService.error('Passwords do not match.');
    }
  }
}
