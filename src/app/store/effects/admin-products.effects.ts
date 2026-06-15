import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadAdminProducts,
  loadAdminProductsSuccess,
  loadAdminProductsFailure,
} from '../actions/admin-products.actions';
import { selectAdminProductsState } from '../selectors/admin-products.selectors';
import { GenericService } from '@shared/services/generic.service';
import { ADMIN_PRODUCTS } from '@config/index';

@Injectable()
export class AdminProductsEffects {
  loadAdminProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminProducts),
      withLatestFrom(this.store.select(selectAdminProductsState)),
      filter(
        ([action, state]) =>
          !!action.force || !state.loaded || action.status !== state.status
      ),
      exhaustMap(([{ status }]) => {
        const url =
          status === 'all'
            ? ADMIN_PRODUCTS
            : `${ADMIN_PRODUCTS}?status=${status}`;
        return this.genericService.getObservableToken(url).pipe(
          map((res: any) =>
            loadAdminProductsSuccess({ products: res?.data ?? [], status })
          ),
          catchError((error) => of(loadAdminProductsFailure({ error })))
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private genericService: GenericService
  ) {}
}
