import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of, withLatestFrom, filter } from 'rxjs';
import {
  loadWishlist,
  loadWishlistFailure,
  loadWishlistSuccess,
} from '../actions/wishlist.actions';
import { GenericService } from '@shared/services/generic.service';
import { USER_WISHLIST } from '@config/index';
import { selectUserData } from '../selectors/user.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class WishlistEffects {
  loadWishlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWishlist),
      withLatestFrom(this.store.select(selectUserData)), // Get user data from Store
      filter(([_, userData]) => !!userData?.user?.data), // Ensure user data exists
      switchMap(([_, userData]) => {
        const url = USER_WISHLIST + `${userData.user.data._id}`;
        return this.genericService.getObservable(url).pipe(
          map((response: any) =>
            loadWishlistSuccess({ wishlist: response.data || [] })
          ),
          catchError((error) => of(loadWishlistFailure({ error })))
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
