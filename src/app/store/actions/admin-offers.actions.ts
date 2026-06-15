import { createAction, props } from '@ngrx/store';

export const loadAdminOffers = createAction('[AdminOffers] Load');
export const reloadAdminOffers = createAction('[AdminOffers] Reload');

export const loadAdminOffersSuccess = createAction(
  '[AdminOffers] Load Success',
  props<{ offers: any[] }>()
);

export const loadAdminOffersFailure = createAction(
  '[AdminOffers] Load Failure',
  props<{ error: string }>()
);

// Immutably replace a single offer in the cached list (e.g. after a status
// toggle) without re-fetching the whole list.
export const upsertAdminOffer = createAction(
  '[AdminOffers] Upsert Offer',
  props<{ offer: any }>()
);
