import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import {
  loadGst,
  loadGstSuccess,
  loadGstFailure,
  submitGst,
  submitGstSuccess,
  submitGstFailure,
} from '../actions/gst.actions';
import { selectGstState } from '../selectors/gst.selectors';
import { GenericService } from 'src/app/shared/services/generic.service';
import { GST_ONBOARDING } from 'src/app/config';

@Injectable()
export class GstEffects {
  loadGst$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGst),
      withLatestFrom(this.store.select(selectGstState)),
      filter(([, state]) => !state.loaded),
      exhaustMap(() =>
        this.genericService.getObservableToken(GST_ONBOARDING).pipe(
          map((res: any) => loadGstSuccess({ data: res?.data ?? null })),
          catchError((err) => of(loadGstFailure({ error: err })))
        )
      )
    )
  );

  submitGst$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitGst),
      mergeMap((action) =>
        this.genericService.postObservableToken(action.url, action.payload).pipe(
          map((result: any) => submitGstSuccess({ data: result.data })),
          catchError((err) => of(submitGstFailure({ error: err })))
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
