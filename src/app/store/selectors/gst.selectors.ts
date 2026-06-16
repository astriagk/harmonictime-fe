import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GstState } from '../reducers/gst.reducer';

export const selectGstState = createFeatureSelector<GstState>('gst');

export const selectGstData = createSelector(selectGstState, (state) => state.data);
export const selectGstLoaded = createSelector(selectGstState, (state) => state.loaded);
export const selectGstLoading = createSelector(selectGstState, (state) => state.loading);
export const selectGstError = createSelector(selectGstState, (state) => state.error);
