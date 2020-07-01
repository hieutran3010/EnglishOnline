import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.customerList || initialState;

export const selectNeedToReload = createSelector(
  [selectDomain],
  customerListState => customerListState.needToReload,
);
