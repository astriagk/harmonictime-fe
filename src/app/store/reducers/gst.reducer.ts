import { createReducer, on } from '@ngrx/store';
import { submitGst, submitGstSuccess, submitGstFailure } from '../actions/gst.actions';

export interface GstState {
  data: any;
  loading: boolean;
  error: any;
}

export const initialState: GstState = {
  data: null,
  loading: false,
  error: null,
};

export const gstReducer = createReducer(
  initialState,
  on(submitGst, (state) => ({ ...state, loading: true, error: null })),
  on(submitGstSuccess, (state, { data }) => ({ ...state, data, loading: false, error: null })),
  on(submitGstFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
