// user.service.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  loadUserSuccess,
  loginUserSuccess,
} from 'src/app/store/actions/user.actions';
import { GenericService } from './generic.service';
import { USER } from '@config/index';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDataSubject = new BehaviorSubject<any>(null); // Initial value is null
  constructor(private store: Store, private genericService: GenericService) {}

  loadUserFromLocalStorage() {
    const token = localStorage.getItem('token');
    if (token) {
      this.store.dispatch(loginUserSuccess({ data: { data: { token } } }));
    }
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.removeItem('token');
    this.userDataSubject.next(null);
    this.store.dispatch(loginUserSuccess({ data: null }));
    this.store.dispatch(loadUserSuccess({ user: null }));
  }

  getUserData(): Observable<any> {
    const url = USER;
    return this.genericService
      .getObservableToken(url)
      .pipe(tap((response) => this.userDataSubject.next(response.data)));
  }
}
