import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.vendorCreation || initialState;

export const selectIsSubmittingVendor = createSelector(
  [selectDomain],
  vendorCreationState => vendorCreationState.isSubmitting,
);

export const selectVendor = createSelector(
  [selectDomain],
  vendorCreationState => vendorCreationState.vendor,
);
