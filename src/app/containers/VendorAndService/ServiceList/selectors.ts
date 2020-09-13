import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.serviceList || initialState;

export const selectIsWorkingOnServiceList = createSelector(
  [selectDomain],
  serviceListState => serviceListState.isWorkingOnServiceList,
);

export const selectServices = createSelector(
  [selectDomain],
  serviceListState => serviceListState.services,
);
