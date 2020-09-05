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

export const selectEditingZone = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.editingZone,
);

export const selectZones = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.zones,
);

export const selectIsFetchingZones = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isFetchingZones,
);

export const selectIsEditingVendor = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isSubmitEditingVendor,
);

export const selectIsFetchingParcelServices = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isFetchingParcelServices,
);

export const selectParcelServices = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.parcelServices,
);

export const selectAssignedParcelServices = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.assignedParcelServices,
);

export const selectIsFetchingAssignedParcelServices = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isFetchingAssignedParcelServices,
);

export const selectIsSubmittingSelectedServices = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isSubmittingSelectedServices,
);
