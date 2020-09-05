import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.billView || initialState;

export const selectIsSubmitting = createSelector(
  [selectDomain],
  billViewState => billViewState.isSubmitting,
);
