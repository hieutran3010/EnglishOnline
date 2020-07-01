import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.userList || initialState;

export const selectIsFetchingUsers = createSelector(
  [selectDomain],
  userListState => userListState.isFetchingUsers,
);

export const selectUsers = createSelector(
  [selectDomain],
  userListState => userListState.users,
);
