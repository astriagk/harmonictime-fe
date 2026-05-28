import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  switchMap,
  map,
  catchError,
  of,
  withLatestFrom,
  filter,
  forkJoin,
} from 'rxjs';
import {
  loadCart,
  loadCartFailure,
  loadCartSuccess,
} from '../actions/cart.actions';
import { GenericService } from '@shared/services/generic.service';
import { GET_PRODUCT_BY_ID, USER_CART } from '@config/index';
import { selectUserData } from '../selectors/user.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class CartEffects {
  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCart),
      withLatestFrom(this.store.select(selectUserData)),
      filter(([_, userData]) => !!userData?.user?.data),
      switchMap(([_, userData]) => {
        const url = USER_CART + `${userData.user.data._id}`;
        return this.genericService.getObservable(url).pipe(
          switchMap((response: any) => {
            const cartItems: any[] = response.data || [];
            if (!cartItems.length) {
              return of(loadCartSuccess({ cart: [] }));
            }
            // Enrich each cart record with full product details
            const productRequests = cartItems.map((item: any) =>
              this.genericService
                .getObservable(`${GET_PRODUCT_BY_ID}${item.ProductID}`)
                .pipe(
                  map((res: any) => {
                    const product = res?.data?.[0] ?? res?.data ?? {};
                    return { ...product, ...item };
                  }),
                  catchError(() => of(item)),
                ),
            );
            return forkJoin(productRequests).pipe(
              map((enriched) => loadCartSuccess({ cart: enriched })),
            );
          }),
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
