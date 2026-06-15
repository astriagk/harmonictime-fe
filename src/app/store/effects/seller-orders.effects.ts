import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, switchMap, take, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadSellerOrders,
  loadSellerOrdersSuccess,
  loadSellerOrdersFailure,
} from '../actions/seller-orders.actions';
import { selectSellerOrdersLoaded } from '../selectors/seller-orders.selectors';
import { selectUserData } from '../selectors/user.selectors';
import { GenericService } from '@shared/services/generic.service';
import { GET_SELLER_ORDERS } from '@config/index';

@Injectable()
export class SellerOrdersEffects {
  loadSellerOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSellerOrders),
      withLatestFrom(this.store.select(selectSellerOrdersLoaded)),
      filter(([, loaded]) => !loaded),
      switchMap(() =>
        this.store.select(selectUserData).pipe(
          filter((userState) => !!userState?.user?.data?._id),
          take(1),
          exhaustMap((userState) => {
            const userId = userState.user.data._id;
            return this.genericService
              .getObservable(`${GET_SELLER_ORDERS}${userId}`)
              .pipe(
                map((res: any) => loadSellerOrdersSuccess({ orders: res?.data || [] })),
                catchError((err) => of(loadSellerOrdersFailure({ error: err.message })))
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
