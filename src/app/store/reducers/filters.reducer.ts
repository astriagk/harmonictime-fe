import { createReducer, on } from '@ngrx/store';
import {
  loadFilters,
  loadFiltersFailure,
  loadFiltersSuccess,
} from '../actions/filters.actions';

export interface FiltersState {
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
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: FiltersState = {
  brands: [],
  categories: [],
  collections: [],
  dialColors: [],
  movements: [],
  strapMaterials: [],
  caseMaterials: [],
  watchMarkers: [],
  deliveryOptions: [],
  recipients: [],
  loaded: false,
  loading: false,
  error: null,
};

export const filtersReducer = createReducer(
  initialState,

  on(loadFilters, (state) => ({
    ...state,
    loading: !state.loaded,
    error: null,
  })),

  on(loadFiltersSuccess, (state, { brands, categories, collections, dialColors, movements, strapMaterials, caseMaterials, watchMarkers, deliveryOptions, recipients }) => ({
    ...state,
    brands,
    categories,
    collections,
    dialColors,
    movements,
    strapMaterials,
    caseMaterials,
    watchMarkers,
    deliveryOptions,
    recipients,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadFiltersFailure, (state, { error }) => ({
    ...state,
    loaded: false,
    loading: false,
    error,
  }))
);
