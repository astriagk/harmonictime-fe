import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, map, catchError, of, withLatestFrom, filter } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  loadOrders,
  loadOrdersFailure,
  loadOrdersSuccess,
} from '../actions/orders.actions';
import { selectOrdersLoaded } from '../selectors/orders.selectors';
import { GenericService } from '@shared/services/generic.service';
import { GET_ORDERS } from '@config/index';

@Injectable()
export class OrdersEffects {
  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadOrders),
      withLatestFrom(this.store.select(selectOrdersLoaded)),
      filter(([action, loaded]) => !!action.force || !loaded),
      exhaustMap(([{ userId }]) =>
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
    private genericService: GenericService,
    private store: Store
  ) {}
}
