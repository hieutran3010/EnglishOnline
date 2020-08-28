import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.billUpdating || initialState;

export const selectIsFetchingBill = createSelector(
  [selectDomain],
  billUpdatingState => billUpdatingState.isFetchingBill,
);

export const selectBill = createSelector(
  [selectDomain],
  billUpdatingState => billUpdatingState.bill,
);

export const selectIsShowBillReview = createSelector(
  [selectDomain],
  billUpdatingState => billUpdatingState.isShowBillReview,
);
