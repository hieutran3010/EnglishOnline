import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.homepage || initialState;

export const selectScreenMode = createSelector(
  [selectDomain],
  homepageState => homepageState.screenMode,
);

export const selectCollapsedMenu = createSelector(
  [selectDomain],
  homepageState => homepageState.collapsedMenu,
);
