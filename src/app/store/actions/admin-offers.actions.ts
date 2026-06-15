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
