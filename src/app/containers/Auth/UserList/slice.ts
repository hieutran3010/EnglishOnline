import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';
import User from 'app/models/user';

// The initial state of the UserList container
export const initialState: ContainerState = {
  isFetchingUsers: false,
  users: [],
};

const userListSlice = createSlice({
  name: 'userList',
  initialState,
  reducers: {
    setIsFetchingUsers(state, action: PayloadAction<boolean>) {
      state.isFetchingUsers = action.payload;
    },
    fetchUsers(state) {},
    fetchUserCompleted(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = userListSlice;
