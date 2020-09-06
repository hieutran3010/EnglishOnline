import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.billsInMonth || initialState;

export const selectSelectedMonth = createSelector(
  [selectDomain],
  workspaceState => workspaceState.selectedMonth,
);

export const selectIsViewArchivedBills = createSelector(
  [selectDomain],
  workspaceState => workspaceState.isViewArchivedBills,
);
