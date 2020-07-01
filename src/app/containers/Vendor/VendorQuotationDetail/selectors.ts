import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.vendorQuotationDetail || initialState;

export const selectIsFetchingVendor = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isFetchingVendor,
);

export const selectVendor = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.vendor,
);

export const selectIsSubmittingData = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.isSubmittingData,
);

export const selectSubmitHasErrorIndicator = createSelector(
  [selectDomain],
  vendorQuotationState => vendorQuotationState.submitHasError,
);
