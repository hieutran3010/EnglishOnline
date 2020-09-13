import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.vendorDetail || initialState;

export const selectVendor = createSelector(
  [selectDomain],
  vendorDetailState => vendorDetailState.vendor,
);

export const selectIsFetchingVendor = createSelector(
  [selectDomain],
  vendorDetailState => vendorDetailState.isFetchingVendor,
);
