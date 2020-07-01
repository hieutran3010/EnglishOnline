import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import User from 'app/models/user';
import { ContainerState } from './types';

// The initial state of the UserCreateOrUpdatePage container
export const initialState: ContainerState = {
  isSubmitting: false,
  error: '',

  isFetchingUser: false,
  user: new User(),
};

const userCreateOrUpdatePageSlice = createSlice({
  name: 'userCreateOrUpdatePage',
  initialState,
  reducers: {
    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    createUser(state, action: PayloadAction<User>) {},
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    fetchUser(state, action: PayloadAction<string>) {
      state.isFetchingUser = true;
    },
    fetchUserCompleted(state, action: PayloadAction<User>) {
      state.isFetchingUser = false;
      state.user = action.payload;
    },

    updateUser(state, action: PayloadAction<User>) {},
  },
});

export const { actions, reducer, name: sliceKey } = userCreateOrUpdatePageSlice;
