import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.workspace || initialState;

export const selectNumberOfUncheckedVatBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.numberOfUncheckedVatBills,
);

export const selectMyBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.myBills,
);

export const selectIsLoadingMyBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isLoadingMyBills,
);

export const selectTotalMyBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.totalMyBills,
);

export const selectMyBillsCurrentPage = createSelector(
  [selectDomain],
  workspaceState => workspaceState.page,
);

export const selectMyBillsPageSize = createSelector(
  [selectDomain],
  workspaceState => workspaceState.pageSize,
);

export const selectSelectedMonth = createSelector(
  [selectDomain],
  workspaceState => workspaceState.selectedMonth,
);

export const selectSearchKey = createSelector(
  [selectDomain],
  workspaceState => workspaceState.searchKey,
);

export const selectTotalSelfCreatedBillsToday = createSelector(
  [selectDomain],
  workspaceState => workspaceState.totalSelfCreatedBillsToday,
);
