import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadProducts,
  searchProducts,
  loadProductsFailure,
  loadProductsSuccess,
  loadProductDetail,
  loadProductDetailSuccess,
  loadProductDetailFailure,
  loadEditProduct,
  loadEditProductSuccess,
  loadEditProductFailure,
} from '../actions/product.actions';
import {
  selectProductsLoaded,
  selectProductsSearchQuery,
  selectProductDetailId,
} from '../selectors/product.selectors';
import { GenericService } from '@shared/services/generic.service';
import { PRODUCT, SEARCH_PRODUCTS, GET_PRODUCT_BY_ID } from '@config/index';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      withLatestFrom(
        this.store.select(selectProductsLoaded),
        this.store.select(selectProductsSearchQuery)
      ),
      // Fetch the full catalog on first load, or when the current list is search
      // results (searchQuery set) and we're switching back to "all products".
      filter(([, loaded, searchQuery]) => !loaded || searchQuery !== null),
      exhaustMap(() =>
        this.genericService.getObservable(PRODUCT).pipe(
          map((response: any) =>
            loadProductsSuccess({ products: response.data || [], query: null })
          ),
          catchError((error) =>
            of(loadProductsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Full-text search hits /products/search?q=. Same response shape as PRODUCT,
  // so results land in the shared `products` state via loadProductsSuccess.
  // switchMap cancels an in-flight search when a newer term arrives.
  searchProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchProducts),
      withLatestFrom(this.store.select(selectProductsSearchQuery)),
      // Skip if we're already showing results for this exact term.
      filter(([action, currentQuery]) => action.query !== currentQuery),
      switchMap(([action]) =>
        this.genericService
          .getObservable(`${SEARCH_PRODUCTS}?q=${encodeURIComponent(action.query)}`)
          .pipe(
            map((response: any) =>
              loadProductsSuccess({
                products: response.data || [],
                query: action.query,
              })
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

  // Seller edit form: authenticated single-product fetch, always fresh so the
  // form reflects the latest saved state after an edit.
  loadEditProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadEditProduct),
      exhaustMap((action) =>
        this.genericService
          .getObservableToken(GET_PRODUCT_BY_ID + action.id)
          .pipe(
            map((response: any) =>
              loadEditProductSuccess({ product: response?.data?.[0] })
            ),
            catchError((error) =>
              of(loadEditProductFailure({ error: error.message }))
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
