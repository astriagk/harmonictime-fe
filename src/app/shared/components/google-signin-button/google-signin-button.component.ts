import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { GOOGLE_LOGIN } from 'src/app/config';
import { loginUser } from 'src/app/store/actions/user.actions';
import {
  selectUserData,
  selectUserError,
} from 'src/app/store/selectors/user.selectors';
import { GoogleAuthService } from '@shared/services/google-auth.service';

/**
 * "Continue with Google" button, used on both the login and register pages.
 *
 * Sends the Google ID token to POST /auth/google via the shared `loginUser`
 * action — that endpoint returns the same session payload as email/password
 * login, so the existing effects handle token storage, the guest-cart merge and
 * the post-login redirect. Nothing here navigates.
 */
@Component({
  selector: 'app-google-signin-button',
  templateUrl: './google-signin-button.component.html',
  styleUrls: ['./google-signin-button.component.scss'],
})
export class GoogleSignInButtonComponent implements AfterViewInit, OnDestroy {
  /** 'continue_with' on login, 'signup_with' on register. */
  @Input() text: 'continue_with' | 'signup_with' | 'signin_with' =
    'continue_with';

  /** Optional line under the button, e.g. the buyer-account caveat on register. */
  @Input() hint = '';

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLDivElement>;

  /** Hides the whole block when GSI is unavailable or unconfigured. */
  available = true;
  signingIn = false;

  private subs = new Subscription();

  constructor(
    private googleAuth: GoogleAuthService,
    private store: Store,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  async ngAfterViewInit() {
    this.available = await this.googleAuth.renderButton(
      this.googleBtn.nativeElement,
      (idToken) => this.signIn(idToken),
      { text: this.text },
    );
  }

  private signIn(idToken: string) {
    if (this.signingIn) return;
    this.signingIn = true;

    // Dispatch first: the reducer clears `data`/`error` synchronously, so the
    // subscriptions below can't pick up a previous attempt's result. The HTTP
    // call itself is async, so nothing is missed.
    this.store.dispatch(loginUser({ url: GOOGLE_LOGIN, payload: { idToken } }));

    this.subs.add(
      this.store
        .select(selectUserError)
        .pipe(
          filter((error: any) => !!error),
          take(1),
        )
        .subscribe((error: any) => this.onError(error)),
    );

    this.subs.add(
      this.store
        .select(selectUserData)
        .pipe(
          filter((state: any) => !!state?.data?.token),
          take(1),
        )
        .subscribe(() => {
          this.signingIn = false;
          this.toastr.success('Signed in with Google');
        }),
    );
  }

  private onError(error: any) {
    this.signingIn = false;

    // Google's session is no longer trustworthy from our side — force the
    // account chooser next time rather than silently retrying the same account.
    this.googleAuth.disableAutoSelect();

    const data = error?.error?.data;
    if (error?.status === 403 && (data?.blocked || data?.suspended)) {
      this.router.navigate(['/auth/account-blocked'], {
        queryParams: { reason: data.blocked ? 'blocked' : 'suspended' },
      });
      return;
    }

    // The API returns usable copy here (e.g. an unverified Google address), so
    // prefer it over a generic message.
    this.toastr.error(
      error?.error?.message || 'Could not sign in with Google. Please try again.',
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
