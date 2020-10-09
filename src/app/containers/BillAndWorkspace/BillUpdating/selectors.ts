import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.billUpdating || initialState;

export const selectIsFetchingBill = createSelector(
  [selectDomain],
  billUpdatingState => billUpdatingState.isFetchingBill,
);
