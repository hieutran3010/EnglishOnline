import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.post || initialState;

export const selectPosts = createSelector(
  [selectDomain],
  postState => postState.posts,
);

export const selectIsFetchingPosts = createSelector(
  [selectDomain],
  postState => postState.isFetchingPosts,
);
