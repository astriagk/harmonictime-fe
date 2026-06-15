import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, switchMap, take, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadSellerProducts,
  loadSellerProductsSuccess,
  loadSellerProductsFailure,
} from '../actions/seller-products.actions';
import { selectSellerProductsLoaded } from '../selectors/seller-products.selectors';
import { selectUserData } from '../selectors/user.selectors';
import { GenericService } from '@shared/services/generic.service';
import { PRODUCT } from '@config/index';

@Injectable()
export class SellerProductsEffects {
  loadSellerProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSellerProducts),
      withLatestFrom(this.store.select(selectSellerProductsLoaded)),
      filter(([action, loaded]) => !!action.force || !loaded),
      switchMap(() =>
        this.store.select(selectUserData).pipe(
          filter((userState) => !!userState?.user?.data?._id),
          take(1),
          exhaustMap((userState) => {
            const userId = userState.user.data._id;
            return this.genericService
              .getObservable(`${PRODUCT}?UserID=${userId}&IsAvailable=all`)
              .pipe(
                map((res: any) => loadSellerProductsSuccess({ products: res?.data || [] })),
                catchError((err) => of(loadSellerProductsFailure({ error: err.message })))
              );
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private genericService: GenericService
  ) {}
}
