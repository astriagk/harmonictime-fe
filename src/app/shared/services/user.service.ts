// user.service.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  loadUser,
  logout as logoutAction,
} from 'src/app/store/actions/user.actions';
import { GenericService } from './generic.service';
import { UPDATE_USER, UPLOAD_SINGLE, USER, VERIFY_TOKEN } from '@config/index';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { GoogleAuthService } from './google-auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDataSubject = new BehaviorSubject<any>(null);
  constructor(
    private store: Store,
    private genericService: GenericService,
    private chatService: ChatService,
    private googleAuth: GoogleAuthService,
    private router: Router,
  ) {}

  verifyAndRestoreSession() {
    const rawToken = localStorage.getItem('token');
    if (!rawToken) return;

    const token = JSON.parse(rawToken);
    const rawRefresh = localStorage.getItem('refreshToken');
    const payload: any = { token };
    if (rawRefresh) payload.refreshToken = JSON.parse(rawRefresh);

    this.genericService.postObservable(VERIFY_TOKEN, payload).subscribe({
      next: (res: any) => {
        const d = res?.data;
        if (d?.refreshed && d?.newToken) {
          localStorage.setItem('token', JSON.stringify(d.newToken));
        }
        if (d?.valid || d?.refreshed) {
          this.store.dispatch(loadUser({ skipNavigation: true }));
        } else {
          this.logout();
          this.router.navigate(['/auth/login']);
        }
      },
      error: (err: any) => {
        if (err?.status === 401) {
          this.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.router.navigate(['/not-found']);
        }
      },
    });
  }

  logout() {
    this.chatService.disconnect();
    // Otherwise GSI silently re-signs the same Google account back in on the
    // next visit to the login page, which reads as "logout didn't work".
    this.googleAuth.disableAutoSelect();
    localStorage.clear();
    sessionStorage.clear();
    this.userDataSubject.next(null);
    this.store.dispatch(logoutAction()); // resets entire NgRx store
  }

  uploadAndSaveAvatar(userId: string, file: File): Observable<string> {
    const form = new FormData();
    form.append('image', file);
    return this.genericService.uploadFormDataToken(UPLOAD_SINGLE, form).pipe(
      switchMap((res: any) => {
        const url: string = res?.url ?? res?.data?.url ?? '';
        return this.genericService
          .putObservableToken(UPDATE_USER(userId), { profilePicUrl: url })
          .pipe(map(() => url));
      })
    );
  }

  getUserData(): Observable<any> {
    const url = USER;
    return this.genericService.getObservableToken(url).pipe(
      map((response) => {
        if (response?.message === 'Unauthorized') {
          throw new Error('Unauthorized');
        }
        return response;
      }),
      tap((response) => this.userDataSubject.next(response.data))
    );
  }
}
