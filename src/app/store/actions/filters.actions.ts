import { createAction, props } from '@ngrx/store';

export const loadFilters = createAction('[Filters] Load Filters');

export const loadFiltersSuccess = createAction(
  '[Filters] Load Filters Success',
  props<{
    brands: any[];
    categories: any[];
    collections: any[];
    dialColors: any[];
    movements: any[];
    strapMaterials: any[];
    caseMaterials: any[];
    watchMarkers: any[];
    deliveryOptions: any[];
    recipients: any[];
  }>()
);

export const loadFiltersFailure = createAction(
  '[Filters] Load Filters Failure',
  props<{ error: string }>()
);
