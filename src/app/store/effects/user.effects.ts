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
  userBlocked,
} from '../actions/user.actions';
import { GenericService } from 'src/app/shared/services/generic.service';
import { UserService } from '@shared/services/user.service';
import { CartService } from '@shared/services/cart.service';
import { WishlistService } from '@shared/services/wishlist.service';
import { persistSession } from '@shared/utils/session';
import { Store } from '@ngrx/store';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private genericService: GenericService,
    public userService: UserService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private store: Store,
  ) {}

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(registerUser),
      mergeMap((action) =>
        this.genericService.postObservable(action.url, action.payload).pipe(
          map((result: any) => registerUserSuccess({ data: result.data })),
          catchError((err) => of(registerUserFailure({ error: err }))),
        ),
      ),
    ),
  );

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUser),
      mergeMap((action) =>
        this.genericService.postObservable(action.url, action.payload).pipe(
          map((result: any) => {
            persistSession(result?.data);
            return loginUserSuccess({ data: result.data });
          }),
          catchError((err) => {
            return of(loginUserFailure({ error: err }));
          }),
        ),
      ),
    ),
  );

  loginSuccessLoadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUserSuccess),
      map(() => loadUser({ skipNavigation: false })),
    ),
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap((action) =>
        this.userService.getUserData().pipe(
          map((user) =>
            loadUserSuccess({ user, skipNavigation: action.skipNavigation }),
          ),
          catchError((error) => of(loadUserFailure({ error }))),
        ),
      ),
    ),
  );

  loadUserFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadUserFailure),
        tap((action) => {
          const data = action.error?.error?.data;
          if (data?.blocked) {
            this.store.dispatch(userBlocked({ suspended: false }));
            this.router.navigate(['/auth/account-blocked'], {
              queryParams: { reason: 'blocked' },
            });
          } else if (data?.suspended) {
            this.store.dispatch(userBlocked({ suspended: true }));
            this.router.navigate(['/auth/account-blocked'], {
              queryParams: { reason: 'suspended' },
            });
          } else {
            this.router.navigate(['/not-found']);
          }
        }),
      ),
    { dispatch: false },
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
          const onBlockedPage = this.router.url.startsWith(
            '/auth/account-blocked',
          );
          // Signing in from the checkout accordions must leave the user on
          // checkout so they can finish the order. The redirect the sign-in
          // asked for is dropped rather than kept, since it belongs to this
          // sign-in — left behind it would hijack some later, unrelated login.
          const onCheckout = this.router.url.startsWith('/buyer/checkout');
          if (onCheckout) {
            localStorage.removeItem('_pendingGstRedirect');
            localStorage.removeItem('_pendingRedirect');
            return;
          }
          if (action.skipNavigation && !onBlockedPage) return;

          const pendingGst = localStorage.getItem('_pendingGstRedirect');
          const pendingRedirect = localStorage.getItem('_pendingRedirect');
          if (pendingGst) {
            localStorage.removeItem('_pendingGstRedirect');
            this.router.navigate(['/auth/gst-onboarding']);
          } else if (pendingRedirect) {
            localStorage.removeItem('_pendingRedirect');
            this.router.navigate([pendingRedirect]);
          } else {
            this.router.navigate(['/buyer/products']);
          }
        }),
      ),
    { dispatch: false },
  );
}
