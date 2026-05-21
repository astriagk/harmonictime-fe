import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  switchMap,
  map,
  catchError,
  of,
  take,
  withLatestFrom,
  filter,
} from 'rxjs';
import {
  loadCart,
  loadCartFailure,
  loadCartSuccess,
} from '../actions/cart.actions';
import { CartService } from '@shared/services/cart.service';
import { GenericService } from '@shared/services/generic.service';
import { UserService } from '@shared/services/user.service';
import { USER_CART } from '@config/index';
import { selectUserData } from '../selectors/user.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class CartEffects {
  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCart),
      withLatestFrom(this.store.select(selectUserData)), // Get user data from Store
      filter(([_, userData]) => !!userData?.user?.data), // Ensure user data exists
      switchMap(([_, userData]) => {
        const url = USER_CART + `${userData.user.data._id}`;
        return this.genericService.getObservable(url).pipe(
          map((response: any) =>
            loadCartSuccess({ cart: response.data || [] })
          ),
          catchError((error) => of(loadCartFailure({ error })))
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private genericService: GenericService,
    private store: Store
  ) {}
}
