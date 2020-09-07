import { PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';
import { isEmpty } from 'lodash';

import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill from 'app/models/bill';

import { ContainerState } from './types';

// The initial state of the Workspace container
export const initialState: ContainerState = {
  bill: new Bill(),
  numberOfUncheckedVatBills: 0,

  needToReloadWorkingBills: false,

  myBills: [],
  isFetchingMyBills: false,
  selectedMonth: moment().month() + 1,
  page: 0,
  pageSize: 10,
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
    resetState(state) {
      state.bill = new Bill();
      state.needToReloadWorkingBills = false;
    },

    fetchMyBills(state, action: PayloadAction<number>) {
      state.selectedMonth = action.payload;
      state.isFetchingMyBills = true;
    },
    fetchMyBillsCompleted(
      state,
      action: PayloadAction<{ bills: Bill[]; newPage: number }>,
    ) {
      const { bills, newPage } = action.payload;
      if (isEmpty(state.myBills)) {
        state.myBills = bills;
      } else {
        if (!isEmpty(bills)) {
          state.myBills.push(...bills);
        }
      }
      state.page = newPage;
      state.isFetchingMyBills = false;
    },
  },
});

export const { actions, reducer, name: sliceKey } = workspaceSlice;
