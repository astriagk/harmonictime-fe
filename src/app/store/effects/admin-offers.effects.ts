import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadAdminOffers,
  reloadAdminOffers,
  loadAdminOffersSuccess,
  loadAdminOffersFailure,
} from '../actions/admin-offers.actions';
import { selectAdminOffersLoaded } from '../selectors/admin-offers.selectors';
import { GenericService } from '@shared/services/generic.service';
import { OFFERS_ALL } from '@config/index';

@Injectable()
export class AdminOffersEffects {
  loadAdminOffers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminOffers),
      withLatestFrom(this.store.select(selectAdminOffersLoaded)),
      filter(([, loaded]) => !loaded),
      exhaustMap(() => this.fetchOffers())
    )
  );

  reloadAdminOffers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadAdminOffers),
      exhaustMap(() => this.fetchOffers())
    )
  );

  private fetchOffers() {
    return this.genericService.getObservable(OFFERS_ALL).pipe(
      map((res: any) => loadAdminOffersSuccess({ offers: res?.data ?? [] })),
      catchError((err) => of(loadAdminOffersFailure({ error: err.message })))
    );
  }

  constructor(
    private actions$: Actions,
    private store: Store,
    private genericService: GenericService
  ) {}
}
