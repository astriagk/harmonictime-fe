// user.service.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  loadUserSuccess,
  loginUserSuccess,
  loginUserFailure,
} from 'src/app/store/actions/user.actions';
import { GenericService } from './generic.service';
import { USER } from '@config/index';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
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
