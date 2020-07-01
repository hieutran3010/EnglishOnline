import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.login || initialState;

export const selectIsBeingLogin = createSelector(
  [selectDomain],
  loginState => loginState.isBeingLogin,
);

export const selectError = createSelector(
  [selectDomain],
  loginState => loginState.error,
);

export const selectRecoveryError = createSelector(
  [selectDomain],
  loginState => loginState.recoveryError,
);
