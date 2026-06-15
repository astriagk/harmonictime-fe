import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadAddresses,
  loadAddressesSuccess,
  loadAddressesFailure,
} from '../actions/addresses.actions';
import { selectAddressesLoaded } from '../selectors/addresses.selectors';
import { GenericService } from '@shared/services/generic.service';
import { GET_ADDRESSES_BY_USER } from '@config/index';

@Injectable()
export class AddressesEffects {
  loadAddresses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAddresses),
      withLatestFrom(this.store.select(selectAddressesLoaded)),
      filter(([action, loaded]) => !!action.force || !loaded),
      exhaustMap(([{ userId }]) =>
        this.genericService
          .getObservable(`${GET_ADDRESSES_BY_USER}${userId}`)
          .pipe(
            map((res: any) =>
              loadAddressesSuccess({ addresses: res?.data ?? res ?? [] })
            ),
            catchError((error) => of(loadAddressesFailure({ error })))
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
