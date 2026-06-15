import { createAction, props } from '@ngrx/store';

// Active offers a seller can apply to products (loaded lazily when the
// apply-offer modal opens). `force: true` bypasses the loaded-cache guard.
export const loadSellerOffers = createAction(
  '[SellerOffers] Load',
  props<{ force?: boolean }>()
);

export const loadSellerOffersSuccess = createAction(
  '[SellerOffers] Load Success',
  props<{ offers: any[] }>()
);

export const loadSellerOffersFailure = createAction(
  '[SellerOffers] Load Failure',
  props<{ error: any }>()
);
