import { Component, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GenericService } from 'src/app/shared/services/generic.service';
import { LOGIN_USER } from 'src/app/config';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { loadUser, loginUser } from 'src/app/store/actions/user.actions';
import {
  selectUserData,
  selectUserError,
} from 'src/app/store/selectors/user.selectors';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  isShowPass = false;

  handleShowPass() {
    this.isShowPass = !this.isShowPass;
  }

  public loginForm!: FormGroup;
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
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    const url = LOGIN_USER;
    this.formSubmitted = true;
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      const payload = {
        email: formValue.email,
        password: formValue.password,
      };
      // Drop any subscriptions from a previous submit so toasts don't stack
      this.userDataSub?.unsubscribe();
      this.userErrorSub?.unsubscribe();

      this.isSubmitting = true;
      this.store.dispatch(loginUser({ url, payload }));

      this.userErrorSub = this.store
        .select(selectUserError)
        .pipe(
          filter((error: any) => !!error),
          take(1)
        )
        .subscribe(() => {
          this.isSubmitting = false;
          this.toastrService.error('Please check email and password !');
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
          this.toastrService.success('Login successful !');
          this.loginForm.reset();
          this.formSubmitted = false; // Reset the form submission state
          this.router.navigate(['/buyer/products']);
        });
    }
  }

  ngOnDestroy() {
    this.userDataSub?.unsubscribe();
    this.userErrorSub?.unsubscribe();
  }
}
