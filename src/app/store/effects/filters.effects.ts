import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { forkJoin } from 'rxjs';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadFilters,
  loadFiltersFailure,
  loadFiltersSuccess,
} from '../actions/filters.actions';
import { selectFiltersLoaded } from '../selectors/filters.selectors';
import { GenericService } from '@shared/services/generic.service';
import {
  GET_BRANDS,
  GET_CATEGORIES,
  GET_COLLECTIONS,
  GET_DIAL_COLORS,
  GET_MOVEMENTS,
  GET_STRAP_MATERIALS,
  GET_CASE_MATERIALS,
  GET_WATCH_MARKERS,
  GET_DELIVERY_OPTIONS,
  GET_RECIPIENTS,
} from '@config/index';

@Injectable()
export class FiltersEffects {
  loadFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFilters),
      withLatestFrom(this.store.select(selectFiltersLoaded)),
      filter(([, loaded]) => !loaded),
      exhaustMap(() =>
        forkJoin({
          brands: this.genericService.getObservable(GET_BRANDS),
          categories: this.genericService.getObservable(GET_CATEGORIES),
          collections: this.genericService.getObservable(GET_COLLECTIONS),
          dialColors: this.genericService.getObservable(GET_DIAL_COLORS),
          movements: this.genericService.getObservable(GET_MOVEMENTS),
          strapMaterials: this.genericService.getObservable(GET_STRAP_MATERIALS),
          caseMaterials: this.genericService.getObservable(GET_CASE_MATERIALS),
          watchMarkers: this.genericService.getObservable(GET_WATCH_MARKERS),
          deliveryOptions: this.genericService.getObservable(GET_DELIVERY_OPTIONS),
          recipients: this.genericService.getObservable(GET_RECIPIENTS),
        }).pipe(
          map((res: any) =>
            loadFiltersSuccess({
              brands: res.brands.data ?? [],
              categories: res.categories.data ?? [],
              collections: res.collections.data ?? [],
              dialColors: res.dialColors.data ?? [],
              movements: res.movements.data ?? [],
              strapMaterials: res.strapMaterials.data ?? [],
              caseMaterials: res.caseMaterials.data ?? [],
              watchMarkers: res.watchMarkers.data ?? [],
              deliveryOptions: res.deliveryOptions.data ?? [],
              recipients: res.recipients.data ?? [],
            })
          ),
          catchError((error) =>
            of(loadFiltersFailure({ error: error.message }))
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
