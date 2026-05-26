// user.service.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  loadUserSuccess,
  loginUserSuccess,
  loginUserFailure,
} from 'src/app/store/actions/user.actions';
import { GenericService } from './generic.service';
import { UPDATE_USER, UPLOAD_SINGLE, USER } from '@config/index';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDataSubject = new BehaviorSubject<any>(null); // Initial value is null
  constructor(
    private store: Store,
    private genericService: GenericService,
    private chatService: ChatService,
  ) {}

  loadUserFromLocalStorage() {
    const token = localStorage.getItem('token');
    if (token) {
      this.store.dispatch(loginUserSuccess({ data: { data: { token } } }));
    }
  }

  logout() {
    this.chatService.disconnect();
    localStorage.clear();
    sessionStorage.clear();
    this.userDataSubject.next(null);
    this.store.dispatch(loginUserFailure({ error: '' }));
    this.store.dispatch(loadUserSuccess({ user: null }));
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
