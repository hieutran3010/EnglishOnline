import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.billDeliveryHistory || initialState;

export const selectIsFetchingHistories = createSelector(
  [selectDomain],
  billDeliveryHistoryState => billDeliveryHistoryState.isFetchingHistories,
);

export const selectHistories = createSelector(
  [selectDomain],
  billDeliveryHistoryState => billDeliveryHistoryState.histories,
);
