import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.billsInMonth || initialState;

export const selectNeedToReload = createSelector(
  [selectDomain],
  workspaceState => workspaceState.needToReload,
);
