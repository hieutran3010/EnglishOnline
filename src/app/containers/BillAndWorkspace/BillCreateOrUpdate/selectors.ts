import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.billCreateOrUpdate || initialState;

export const selectVendors = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.vendors,
);

export const selectIsFetchingVendor = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isFetchingVendor,
);

export const selectIsFetchingVendorCountries = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isFetchingVendorCountries,
);

export const selectVendorCountries = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.vendorCountries,
);

export const selectIsSubmitting = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isSubmitting,
);

export const selectBill = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.bill,
);

export const selectIsFetchingResponsibilityUsers = createSelector(
  [selectDomain],
  billCreateOrUpdateState =>
    billCreateOrUpdateState.isFetchingResponsibilityUsers,
);

export const selectUsers = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.users,
);

export const selectIsAssigningAccountant = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isAssigningAccountant,
);

export const selectIsCalculatingPurchasePrice = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isCalculatingPurchasePrice,
);

export const selectIsDeletingBill = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isDeletingBill,
);

export const selectIsFinalBill = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isFinalBill,
);

export const selectIsAssigningLicense = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.isAssigningLicense,
);

export const selectBillParams = createSelector(
  [selectDomain],
  billCreateOrUpdateState => billCreateOrUpdateState.billParams,
);
