import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.userCreateOrUpdatePage || initialState;

export const selectError = createSelector(
  [selectDomain],
  userCreateOrUpdatePageState => userCreateOrUpdatePageState.error,
);

export const selectIsSubmitting = createSelector(
  [selectDomain],
  userCreateOrUpdatePageState => userCreateOrUpdatePageState.isSubmitting,
);

export const selectIsFetchingUser = createSelector(
  [selectDomain],
  userCreateOrUpdatePageState => userCreateOrUpdatePageState.isFetchingUser,
);

export const selectUser = createSelector(
  [selectDomain],
  userCreateOrUpdatePageState => userCreateOrUpdatePageState.user,
);
