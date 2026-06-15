import { createReducer, on } from '@ngrx/store';
import {
  loadGst,
  loadGstSuccess,
  loadGstFailure,
  submitGst,
  submitGstSuccess,
  submitGstFailure,
} from '../actions/gst.actions';

export interface GstState {
  data: any;
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: GstState = {
  data: null,
  loaded: false,
  loading: false,
  error: null,
};

export const gstReducer = createReducer(
  initialState,

  on(loadGst, (state) => ({ ...state, loading: !state.loaded, error: null })),
  on(loadGstSuccess, (state, { data }) => ({ ...state, data, loaded: true, loading: false, error: null })),
  on(loadGstFailure, (state, { error }) => ({ ...state, loaded: false, loading: false, error })),

  on(submitGst, (state) => ({ ...state, loading: true, error: null })),
  on(submitGstSuccess, (state, { data }) => ({ ...state, data, loaded: true, loading: false, error: null })),
  on(submitGstFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
