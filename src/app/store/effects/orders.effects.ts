import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';
import {
  loadOrders,
  loadOrdersFailure,
  loadOrdersSuccess,
} from '../actions/orders.actions';
import { GenericService } from '@shared/services/generic.service';
import { GET_ORDERS } from '@config/index';

@Injectable()
export class OrdersEffects {
  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadOrders),
      switchMap(({ userId }) =>
        this.genericService.getObservable(`${GET_ORDERS}${userId}`).pipe(
          map((response: any) =>
            loadOrdersSuccess({ orders: response.data || [] })
          ),
          catchError((error) => of(loadOrdersFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private genericService: GenericService
  ) {}
}
