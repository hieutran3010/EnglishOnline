import { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill from 'app/models/bill';

import { ContainerState } from './types';

// The initial state of the Workspace container
export const initialState: ContainerState = {
  bill: new Bill(),
  numberOfUncheckedVatBills: 0,

  needToReloadWorkingBills: false,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    selectBill(state, action: PayloadAction<Bill>) {
      state.bill = new Bill(action.payload);
    },
    initNewBill(state) {
      state.bill = new Bill();
    },

    fetchNumberOfUncheckedVatBill() {},
    fetchNumberOfUncheckedVatBillCompleted(
      state,
      action: PayloadAction<number>,
    ) {
      state.numberOfUncheckedVatBills = action.payload;
    },

    setNeedToReloadWorkingBills(state, action: PayloadAction<boolean>) {
      state.needToReloadWorkingBills = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = workspaceSlice;
