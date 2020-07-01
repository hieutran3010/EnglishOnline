import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.vendorQuotation || initialState;

export const selectVendor = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.vendor,
);

export const selectIsFetchingVendor = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isFetchingVendor,
);

export const selectIsSubmittingZone = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isSubmittingZone,
);

export const selectZones = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.zones,
);

export const selectIsFetchingZones = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isFetchingZones,
);

export const selectMappedCountries = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.mappedCountries,
);

export const selectIsEditingVendor = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isSubmitEditingVendor,
);
