import { createAction, props } from '@ngrx/store';

export const submitGst = createAction(
  '[GST] Submit',
  props<{ url: string; payload: any }>()
);
export const submitGstSuccess = createAction(
  '[GST] Submit Success',
  props<{ data: any }>()
);
export const submitGstFailure = createAction(
  '[GST] Submit Failure',
  props<{ error: any }>()
);
