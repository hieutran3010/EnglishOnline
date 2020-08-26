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
  billDeliveryHistoryState => billDeliveryHistoryState.groupedHistories,
);

export const selectIsDirty = createSelector(
  [selectDomain],
  billDeliveryHistoryState => billDeliveryHistoryState.isDirty,
);

export const selectLastChangeData = createSelector(
  [selectDomain],
  billDeliveryHistoryState => billDeliveryHistoryState.histories,
);

export const selectIsSaving = createSelector(
  [selectDomain],
  billDeliveryHistoryState => billDeliveryHistoryState.isSaving,
);
