import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState, BillViewActionType } from './types';

// The initial state of the BillView container
export const initialState: ContainerState = {
  isSubmitting: false,
};

const billViewSlice = createSlice({
  name: 'billView',
  initialState,
  reducers: {
    archiveBill(state, action: PayloadAction<BillViewActionType>) {},
    restoreArchivedBill(state, action: PayloadAction<BillViewActionType>) {},

    checkPrintedVatBill(state, action: PayloadAction<BillViewActionType>) {},
    returnFinalBillToAccountant(
      state,
      action: PayloadAction<BillViewActionType>,
    ) {},
    forceDeleteBill(state, action: PayloadAction<BillViewActionType>) {},
    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = billViewSlice;
