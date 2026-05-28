import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { submitGst, submitGstSuccess, submitGstFailure } from '../actions/gst.actions';
import { GenericService } from 'src/app/shared/services/generic.service';

@Injectable()
export class GstEffects {
  constructor(
    private actions$: Actions,
    private genericService: GenericService
  ) {}

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
}
