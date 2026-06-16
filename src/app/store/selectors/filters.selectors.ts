import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FiltersState } from '../reducers/filters.reducer';

export const selectFiltersState = createFeatureSelector<FiltersState>('filters');

export const selectFiltersLoaded = createSelector(
  selectFiltersState,
  (state) => state.loaded
);

// ── Shop filter selectors (string names only) ──────────────────────────────

export const selectFilterBrands = createSelector(
  selectFiltersState,
  (state) => [...new Set<string>(state.brands.map((b) => b.BrandName))]
);

export const selectFilterCategories = createSelector(
  selectFiltersState,
  (state) => [...new Set<string>(state.categories.map((c) => c.CategoryName))]
);

export const selectFilterMovements = createSelector(
  selectFiltersState,
  (state) => [...new Set<string>(state.movements.map((m) => m.MovementName))]
);

export const selectFilterStrapMaterials = createSelector(
  selectFiltersState,
  (state) => [...new Set<string>(state.strapMaterials.map((s) => s.StrapMaterialName))]
);

export const selectFilterCaseMaterials = createSelector(
  selectFiltersState,
  (state) => [...new Set<string>(state.caseMaterials.map((c) => c.CaseMaterialName))]
);

export const selectFilterWatchMarkers = createSelector(
  selectFiltersState,
  (state) => [...new Set<string>(state.watchMarkers.map((w) => w.WatchMarkerName))]
);

export const selectFilterRecipients = createSelector(
  selectFiltersState,
  (state) => [...new Set<string>(state.recipients.map((r) => r.RecipientName))]
);

// ── Lookup selectors (full objects for seller add/edit form) ───────────────

export const selectLookupBrands = createSelector(
  selectFiltersState,
  (state) => state.brands
);

export const selectLookupCategories = createSelector(
  selectFiltersState,
  (state) => state.categories
);

export const selectLookupCollections = createSelector(
  selectFiltersState,
  (state) => state.collections
);

export const selectLookupDialColors = createSelector(
  selectFiltersState,
  (state) => state.dialColors
);

export const selectLookupMovements = createSelector(
  selectFiltersState,
  (state) => state.movements
);

export const selectLookupStrapMaterials = createSelector(
  selectFiltersState,
  (state) => state.strapMaterials
);

export const selectLookupCaseMaterials = createSelector(
  selectFiltersState,
  (state) => state.caseMaterials
);

export const selectLookupWatchMarkers = createSelector(
  selectFiltersState,
  (state) => state.watchMarkers
);

export const selectLookupDeliveryOptions = createSelector(
  selectFiltersState,
  (state) => state.deliveryOptions
);

export const selectLookupRecipients = createSelector(
  selectFiltersState,
  (state) => state.recipients
);
