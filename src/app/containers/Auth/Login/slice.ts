import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState, LoginAction } from './types';

// The initial state of the Login container
export const initialState: ContainerState = {
  error: '',
  isBeingLogin: false,
  isRecovering: false,
  recoveryError: '',
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setIsBeingLogin(state, action: PayloadAction<boolean>) {
      state.isBeingLogin = action.payload;
    },
    login(state, action: PayloadAction<LoginAction>) {},
    recoveryPassword(
      state,
      action: PayloadAction<{ email: string; onSent: () => void }>,
    ) {
      state.isRecovering = true;
    },
    recoveryPasswordCompleted(state, action: PayloadAction<string>) {
      const error = action.payload;
      state.isRecovering = false;
      state.recoveryError = error;
    },
  },
});

export const { actions, reducer, name: sliceKey } = loginSlice;
