import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';

// The initial state of the BillAdvanceSearch container
export const initialState: ContainerState = {
  needToReload: false,
};

const billAdvanceSearchSlice = createSlice({
  name: 'billAdvanceSearch',
  initialState,
  reducers: {
    setNeedToReload(state, action: PayloadAction<boolean>) {
      state.needToReload = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = billAdvanceSearchSlice;
