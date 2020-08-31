import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';

import { ContainerState } from './types';
import Bill from 'app/models/bill';

// The initial state of the Workspace container
export const initialState: ContainerState = {
  needToReload: false,
};

const billsInMonthSlice = createSlice({
  name: 'billsInMonth',
  initialState,
  reducers: {
    archivedBill(state, action: PayloadAction<string>) {},
    setNeedToReload(state, action: PayloadAction<boolean>) {
      state.needToReload = action.payload;
    },
    checkPrintedVatBill(state, action: PayloadAction<Bill>) {},
    returnFinalBillToAccountant(state, action: PayloadAction<string>) {},
    restoreArchivedBill(state, action: PayloadAction<string>) {},
    forceDeleteBill(state, action: PayloadAction<string>) {},
  },
});

export const { actions, reducer, name: sliceKey } = billsInMonthSlice;
