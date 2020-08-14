import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';
import Bill from 'app/models/bill';

// The initial state of the BillUpdating container
export const initialState: ContainerState = {
  isFetchingBillError: false,
  isFetchingBill: false,
  bill: new Bill(),
};

const billUpdatingSlice = createSlice({
  name: 'billUpdating',
  initialState,
  reducers: {
    fetchBill(state, action: PayloadAction<string>) {
      state.isFetchingBill = true;
    },
    fetchBillCompleted(state, action: PayloadAction<Bill | undefined>) {
      const bill = action.payload;

      if (bill) {
        state.bill = new Bill(action.payload);
        state.isFetchingBillError = false;
      } else {
        state.isFetchingBillError = true;
      }

      state.isFetchingBill = false;
    },
  },
});

export const { actions, reducer, name: sliceKey } = billUpdatingSlice;
