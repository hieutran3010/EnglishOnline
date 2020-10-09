import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';

// The initial state of the BillUpdating container
export const initialState: ContainerState = {
  isFetchingBill: false,
};

const billUpdatingSlice = createSlice({
  name: 'billUpdating',
  initialState,
  reducers: {
    setIsFetchingBill(state, action: PayloadAction<boolean>) {
      state.isFetchingBill = action.payload;
    },
    fetchBill(state, action: PayloadAction<string>) {},
  },
});

export const { actions, reducer, name: sliceKey } = billUpdatingSlice;
