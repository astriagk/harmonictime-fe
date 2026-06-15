import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadSellerOffers,
  loadSellerOffersSuccess,
  loadSellerOffersFailure,
} from '../actions/seller-offers.actions';
import { selectSellerOffersState } from '../selectors/seller-offers.selectors';
import { GenericService } from '@shared/services/generic.service';
import { OFFERS } from '@config/index';

@Injectable()
export class SellerOffersEffects {
  loadSellerOffers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSellerOffers),
      withLatestFrom(this.store.select(selectSellerOffersState)),
      filter(([action, state]) => !!action.force || !state.loaded),
      exhaustMap(() =>
        this.genericService.getObservable(OFFERS).pipe(
          map((res: any) => loadSellerOffersSuccess({ offers: res?.data ?? [] })),
          catchError((error) => of(loadSellerOffersFailure({ error })))
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
