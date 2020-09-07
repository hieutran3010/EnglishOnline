import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.workspace || initialState;

export const selectBill = createSelector(
  [selectDomain],
  workspaceState => workspaceState.bill,
);

export const selectNumberOfUncheckedVatBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.numberOfUncheckedVatBills,
);

export const selectNeedToReloadWorkingBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.needToReloadWorkingBills,
);

export const selectSelectedMonth = createSelector(
  [selectDomain],
  workspaceState => workspaceState.selectedMonth,
);

export const selectPage = createSelector(
  [selectDomain],
  workspaceState => workspaceState.page,
);

export const selectPageSize = createSelector(
  [selectDomain],
  workspaceState => workspaceState.pageSize,
);
