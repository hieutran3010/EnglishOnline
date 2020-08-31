import map from 'lodash/fp/map';
import findIndex from 'lodash/fp/findIndex';
import remove from 'lodash/fp/remove';
import equals from 'lodash/fp/equals';

import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill, { BillDeliveryHistory } from 'app/models/bill';

import { ContainerState, FetchHistoriesCompletedAction } from './types';

// The initial state of the BillDeliveryHistory container
export const initialState: ContainerState = {
  isFetchingHistories: false,

  histories: [],
  cachedHistories: [],
  isDirty: false,
  isSaving: false,
  billId: '',
  isFetchingBillToView: false,
};

const billDeliveryHistorySlice = createSlice({
  name: 'billDeliveryHistory',
  initialState,
  reducers: {
    fetchBillDeliveryHistories(state, action: PayloadAction<string>) {
      state.isFetchingHistories = true;
      state.billId = action.payload;
    },
    fetchBillDeliveryHistoriesCompleted(
      state,
      action: PayloadAction<FetchHistoriesCompletedAction>,
    ) {
      const { histories, airlineBillId, childBillId } = action.payload;
      const newHistories = map(history => new BillDeliveryHistory(history))(
        histories,
      );

      state.histories = newHistories;
      state.cachedHistories = newHistories;
      state.isDirty = false;
      state.isFetchingHistories = false;
      state.airlineBillId = airlineBillId;
      state.childBillId = childBillId;
    },

    addNew(state, action: PayloadAction<any>) {
      const { date } = action.payload;
      const newHistory = new BillDeliveryHistory(action.payload);
      if (date) {
        newHistory.date = new Date(
          date.year(),
          date.month(),
          date.date(),
          0,
          0,
          0,
        );
      }
      state.histories.push(newHistory);
      checkIsDirty(state);
    },

    update(state, action: PayloadAction<BillDeliveryHistory>) {
      const history = action.payload;
      const existedIndex = findIndex(
        (his: BillDeliveryHistory) => his.id === history.id,
      )(state.histories);

      if (existedIndex >= 0) {
        if (history.date) {
          history.date = new Date(
            history.date.year(),
            history.date.month(),
            history.date.date(),
            0,
            0,
            0,
          );
        }
        state.histories.splice(existedIndex, 1, history);
        checkIsDirty(state);
      }
    },

    delete(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.histories = remove((h: BillDeliveryHistory) => h.id === id)(
        state.histories,
      );

      checkIsDirty(state);
    },

    restore(state) {
      state.histories = state.cachedHistories;
      state.isDirty = false;
    },
    setIsSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    save(state, action: PayloadAction<string>) {},
    saveCompleted(state) {
      state.cachedHistories = state.histories;
      state.isDirty = false;
    },
    fetchBillToView(state, action: PayloadAction<string>) {
      state.isFetchingBillToView = true;
    },
    fetchBillToViewCompleted(state, action: PayloadAction<Bill | undefined>) {
      state.bill = action.payload;
      state.isFetchingBillToView = false;
    },

    reset(state) {
      state.isFetchingHistories = false;

      state.histories = [];
      state.cachedHistories = [];
      state.isDirty = false;
      state.isSaving = false;
      state.billId = '';
      state.airlineBillId = undefined;
      state.childBillId = undefined;
      state.bill = undefined;
      state.isFetchingBillToView = false;
    },
  },
});

const checkIsDirty = (state: ContainerState) => {
  state.isDirty = !equals(state.cachedHistories)(state.histories);
};

export const { actions, reducer, name: sliceKey } = billDeliveryHistorySlice;
