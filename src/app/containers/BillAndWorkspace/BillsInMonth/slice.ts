import { PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';

import { createSlice } from 'utils/@reduxjs/toolkit';

import { ContainerState } from './types';

// The initial state of the Workspace container
export const initialState: ContainerState = {
  selectedMonth: moment().month() + 1,
  isViewArchivedBills: false,
};

const billsInMonthSlice = createSlice({
  name: 'billsInMonth',
  initialState,
  reducers: {
    setSelectedMonth(state, action: PayloadAction<number>) {
      state.selectedMonth = action.payload;
    },
    setIsViewArchivedBills(state, action: PayloadAction<boolean>) {
      state.isViewArchivedBills = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = billsInMonthSlice;
