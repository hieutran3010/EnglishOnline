import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';

// The initial state of the UserProfile container
export const initialState: ContainerState = {
  isChangingPass: false,
  passChangingError: '',
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    changePass(
      state,
      action: PayloadAction<{ newPass: string; onSuccess: () => void }>,
    ) {
      state.isChangingPass = true;
    },
    changePassCompleted(state, action: PayloadAction<string>) {
      state.isChangingPass = false;
      const errorMsg = action.payload;
      state.passChangingError = errorMsg;
    },
    reset(state) {
      state.isChangingPass = false;
      state.passChangingError = '';
    },
  },
});

export const { actions, reducer, name: sliceKey } = userProfileSlice;
