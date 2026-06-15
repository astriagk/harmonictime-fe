import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadProducts,
  loadProductsFailure,
  loadProductsSuccess,
  loadProductDetail,
  loadProductDetailSuccess,
  loadProductDetailFailure,
} from '../actions/product.actions';
import { selectProductsLoaded, selectProductDetailId } from '../selectors/product.selectors';
import { GenericService } from '@shared/services/generic.service';
import { PRODUCT, GET_PRODUCT_BY_ID } from '@config/index';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      withLatestFrom(this.store.select(selectProductsLoaded)),
      filter(([, loaded]) => !loaded),
      exhaustMap(() =>
        this.genericService.getObservable(PRODUCT).pipe(
          map((response: any) =>
            loadProductsSuccess({ products: response.data || [] })
          ),
          catchError((error) =>
            of(loadProductsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  loadProductDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProductDetail),
      withLatestFrom(this.store.select(selectProductDetailId)),
      filter(([action, cachedId]) => action.id !== cachedId),
      exhaustMap(([action]) =>
        this.genericService.getObservable(GET_PRODUCT_BY_ID + action.id).pipe(
          map((response: any) =>
            loadProductDetailSuccess({ product: response?.data?.[0], id: action.id })
          ),
          catchError((error) =>
            of(loadProductDetailFailure({ error: error.message }))
          )
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
