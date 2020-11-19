import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.courses || initialState;

export const selectCourses = createSelector(
  [selectDomain],
  coursesState => coursesState,
);
