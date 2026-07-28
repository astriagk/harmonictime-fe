import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from 'src/app/shared/services/generic.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { loginUserSuccess } from 'src/app/store/actions/user.actions';
import { CONFIRM_EMAIL } from 'src/app/config';
import { persistSession } from '@shared/utils/session';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  public state: 'verifying' | 'success' | 'error' = 'verifying';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private genericService: GenericService,
    private toastrService: ToastrService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      return;
    }
    this.confirmEmail(token);
  }

  private get emailFromUrl() {
    return this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  private confirmEmail(token: string) {
    this.genericService.postObservable(CONFIRM_EMAIL, { token }).subscribe({
      next: (res: any) => {
        const d = res?.data;
        // Stores the session and the redirect flags; navigation is left to the
        // existing effects.
        persistSession(d);

        this.store.dispatch(loginUserSuccess({ data: d }));
        this.state = 'success';
      },
      error: (err: any) => {
        const msg: string = err?.error?.message ?? '';
        if (msg.toLowerCase().includes('expired')) {
          this.router.navigate(['/auth/check-email'], {
            queryParams: { reason: 'expired', email: this.emailFromUrl },
          });
        } else {
          this.state = 'error';
        }
      },
    });
  }
}
