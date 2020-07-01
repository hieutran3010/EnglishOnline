import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.billAdvanceSearch || initialState;

export const selectNeedToReload = createSelector(
  [selectDomain],
  billAdvanceSearchState => billAdvanceSearchState.needToReload,
);
