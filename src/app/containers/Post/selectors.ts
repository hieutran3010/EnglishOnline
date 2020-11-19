import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.post || initialState;

export const selectPost = createSelector(
  [selectDomain],
  postState => postState,
);
