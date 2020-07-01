import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';
import Bill from 'app/models/bill';

// The initial state of the BillAdvanceSearch container
export const initialState: ContainerState = {
  needToReload: false,
};

const billAdvanceSearchSlice = createSlice({
  name: 'billAdvanceSearch',
  initialState,
  reducers: {
    archiveBill(state, action: PayloadAction<string>) {},
    setNeedToReload(state, action: PayloadAction<boolean>) {
      state.needToReload = action.payload;
    },
    checkPrintedVatBill(state, action: PayloadAction<Bill>) {},
  },
});

export const { actions, reducer, name: sliceKey } = billAdvanceSearchSlice;
