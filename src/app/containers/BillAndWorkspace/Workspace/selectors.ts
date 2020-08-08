import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.workspace || initialState;

export const selectVendors = createSelector(
  [selectDomain],
  workspaceState => workspaceState.vendors,
);

export const selectIsFetchingVendor = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isFetchingVendor,
);

export const selectIsFetchingVendorCountries = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isFetchingVendorCountries,
);

export const selectVendorCountries = createSelector(
  [selectDomain],
  workspaceState => workspaceState.vendorCountries,
);

export const selectIsSubmitting = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isSubmitting,
);

export const selectBill = createSelector(
  [selectDomain],
  workspaceState => workspaceState.bill,
);

export const selectIsFetchingResponsibilityUsers = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isFetchingResponsibilityUsers,
);

export const selectUsers = createSelector(
  [selectDomain],
  workspaceState => workspaceState.users,
);

export const selectIsFetchingMyBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isFetchingMyBills,
);

export const selectMyBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.myBills,
);

export const selectIsAssigningAccountant = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isAssigningAccountant,
);

export const selectIsCalculatingPurchasePrice = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isCalculatingPurchasePrice,
);

export const selectIsDeletingBill = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isDeletingBill,
);

export const selectIsFinalBill = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isFinalBill,
);

export const selectIsAssigningLicense = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isAssigningLicense,
);

export const selectBillParams = createSelector(
  [selectDomain],
  workspaceState => workspaceState.billParams,
);

export const selectNumberOfUncheckedVatBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.numberOfUncheckedVatBills,
);

export const selectIsFetchingUnassignedBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isFetchingUnassignedBills,
);

export const selectUnassignedBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.unassignedBills,
);
