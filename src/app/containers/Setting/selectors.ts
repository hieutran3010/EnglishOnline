import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.setting || initialState;

export const selectIsFetchingBillParams = createSelector(
  [selectDomain],
  settingState => settingState.isFetchingAppParams,
);

export const selectBillParams = createSelector(
  [selectDomain],
  settingState => settingState.billParams,
);

export const selectAppParams = createSelector(
  [selectDomain],
  settingState => settingState.appParams,
);

export const selectIsUpdatingBillParams = createSelector(
  [selectDomain],
  settingState => settingState.isUpdatingBillParams,
);
