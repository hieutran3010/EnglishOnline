import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.userProfile || initialState;

export const selectIsChangingPass = createSelector(
  [selectDomain],
  userProfileState => userProfileState.isChangingPass,
);

export const selectPassChangingError = createSelector(
  [selectDomain],
  userProfileState => userProfileState.passChangingError,
);
