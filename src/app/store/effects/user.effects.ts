import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import {
  registerUser,
  registerUserSuccess,
  registerUserFailure,
  loginUserSuccess,
  loginUserFailure,
  loginUser,
  loadUser,
  loadUserSuccess,
  loadUserFailure,
} from '../actions/user.actions';
import { GenericService } from 'src/app/shared/services/generic.service';
import { UserService } from '@shared/services/user.service';
import { CartService } from '@shared/services/cart.service';
import { WishlistService } from '@shared/services/wishlist.service';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private genericService: GenericService,
    public userService: UserService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(registerUser),
      mergeMap((action) =>
        this.genericService.postObservable(action.url, action.payload).pipe(
          map((result: any) => {
            // Persist the token here so the loadUser effect (triggered next)
            // can authenticate getUserData
            if (result?.data?.token) {
              localStorage.setItem('token', JSON.stringify(result.data.token));
            }
            return registerUserSuccess({ data: result.data });
          }),
          catchError((err) => {
            return of(registerUserFailure({ error: err }));
          })
        )
      )
    )
  );

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUser),
      mergeMap((action) =>
        this.genericService.postObservable(action.url, action.payload).pipe(
          map((result: any) => {
            // Persist the token here so the loadUser effect (triggered next)
            // can authenticate getUserData
            if (result?.data?.token) {
              localStorage.setItem('token', JSON.stringify(result.data.token));
            }
            return loginUserSuccess({ data: result.data });
          }),
          catchError((err) => {
            return of(loginUserFailure({ error: err }));
          })
        )
      )
    )
  );

  loginSuccessLoadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUserSuccess), // Wait for login to succeed
      map(() => loadUser()) // Dispatch loadUser action
    )
  );

  registerSuccessLoadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(registerUserSuccess), // Wait for login to succeed
      map(() => loadUser()) // Dispatch loadUser action
    )
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap(() =>
        this.userService.getUserData().pipe(
          map((user) => loadUserSuccess({ user })),
          catchError((error) => of(loadUserFailure({ error })))
        )
      )
    )
  );

  loadUserFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadUserFailure),
        tap(() => this.router.navigate(['/not-found']))
      ),
    { dispatch: false }
  );

  mergeGuestCartOnLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadUserSuccess),
        tap((action: any) => {
          const userId = action?.user?.data?._id;
          if (userId) {
            this.cartService.mergeGuestCart(userId);
            this.wishlistService.mergeGuestWishlist(userId);
          }
          this.router.navigate(['/buyer/products']);
        })
      ),
    { dispatch: false }
  );
}
