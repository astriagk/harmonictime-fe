import { createAction, props } from '@ngrx/store';

export const loadGst = createAction('[GST] Load');
export const loadGstSuccess = createAction('[GST] Load Success', props<{ data: any }>());
export const loadGstFailure = createAction('[GST] Load Failure', props<{ error: any }>());

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
