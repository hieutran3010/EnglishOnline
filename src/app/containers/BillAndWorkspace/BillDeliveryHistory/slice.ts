import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState, GroupedHistory } from './types';

// The initial state of the BillDeliveryHistory container
export const initialState: ContainerState = {
  isFetchingHistories: false,
  histories: [],
};

const billDeliveryHistorySlice = createSlice({
  name: 'billDeliveryHistory',
  initialState,
  reducers: {
    fetchBillDeliveryHistories(state, action: PayloadAction<string>) {
      state.isFetchingHistories = true;
    },
    fetchBillDeliveryHistoriesCompleted(
      state,
      action: PayloadAction<GroupedHistory[]>,
    ) {
      state.histories = action.payload;
      state.isFetchingHistories = false;
    },
  },
});

export const { actions, reducer, name: sliceKey } = billDeliveryHistorySlice;
