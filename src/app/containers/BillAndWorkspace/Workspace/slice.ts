import { PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';

import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill, { BILL_STATUS } from 'app/models/bill';

import { ContainerState } from './types';
import { size } from 'lodash';
import remove from 'lodash/fp/remove';
import findIndex from 'lodash/fp/findIndex';
import { getRandomColor } from 'utils/colorUtils';
import map from 'lodash/fp/map';
import set from 'lodash/fp/set';
import { BillDeliveryHistoriesUpdatedEventArgs } from '../BillDeliveryHistory/types';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';

// The initial state of the Workspace container
export const initialState: ContainerState = {
  numberOfUncheckedVatBills: 0,

  myBills: [],
  pageSize: 20,
  page: 0,
  totalMyBills: 0,
  isLoadingMyBills: false,

  selectedMonth: moment().month() + 1,
  billDateColorMap: {},
  totalSelfCreatedBillsToday: 0,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    fetchNumberOfUncheckedVatBill() {},
    fetchNumberOfUncheckedVatBillCompleted(
      state,
      action: PayloadAction<number>,
    ) {
      state.numberOfUncheckedVatBills = action.payload;
    },

    setIsLoadingMyBills(state, action: PayloadAction<boolean>) {
      state.isLoadingMyBills = action.payload;
    },
    fetchMyBills(state, action: PayloadAction<boolean | undefined>) {
      state.isLoadingMyBills = true;
    },
    fetchMyBillsCompleted(
      state,
      action: PayloadAction<{ bills: Bill[]; totalItems: number }>,
    ) {
      const { bills, totalItems } = action.payload;

      state.myBills = formatBills(state, bills);
      state.totalMyBills = totalItems;
      if (size(bills) > 0) {
        state.page = 1;
      }

      state.isLoadingMyBills = false;
    },
    fetchMoreMyBills(state) {
      state.isLoadingMyBills = true;
    },
    fetchMoreMyBillsCompleted(
      state,
      action: PayloadAction<{ bills: Bill[]; page: number }>,
    ) {
      const { bills, page } = action.payload;
      state.myBills = state.myBills.concat(formatBills(state, bills));
      state.page = page;
      state.isLoadingMyBills = false;
    },
    changeMonth(state, action: PayloadAction<number>) {
      state.selectedMonth = action.payload;
    },
    search(state, action: PayloadAction<string | undefined>) {
      state.searchKey = action.payload;
    },
    deleteMyBill(state, action: PayloadAction<string>) {
      const deletedBillId = action.payload;
      state.myBills = remove((bill: Bill) => bill.id === deletedBillId)(
        state.myBills,
      );
    },
    updateMyBill(
      state,
      action: PayloadAction<{ bill: Bill; isNew?: boolean }>,
    ) {
      const { bill, isNew } = action.payload;
      const formattedBill = formatBill(state, bill);
      if (isNew === true) {
        const canAdd = canAddToMyBills(bill);
        if (canAdd) {
          state.myBills.splice(0, 0, formatBill(state, formattedBill));
        }
      } else {
        const billIndex = findIndex((myBill: Bill) => myBill.id === bill.id)(
          state.myBills,
        );
        if (billIndex >= 0) {
          state.myBills.splice(billIndex, 1, formattedBill);
        }
      }
    },
    updateBillDeliveryHistories(
      state,
      action: PayloadAction<BillDeliveryHistoriesUpdatedEventArgs>,
    ) {
      const { billId, histories } = action.payload;
      const billIndex = findIndex((myBill: Bill) => myBill.id === billId)(
        state.myBills,
      );
      const relatedBill = state.myBills[billIndex];
      state.myBills[billIndex] = set(
        'billDeliveryHistories',
        histories,
      )(relatedBill);
    },
    fetchTotalMyBillsCreatedToday() {},
    fetchTotalMyBillsCreatedTodayCompleted(
      state,
      action: PayloadAction<number>,
    ) {
      state.totalSelfCreatedBillsToday = action.payload;
    },
  },
});

const formatBills = (state, bills: Bill[]) => {
  return map((b: Bill) => {
    return formatBill(state, b);
  })(bills);
};

const formatBill = (state, bill: Bill) => {
  const billDateColor = getBillDateColor(state, bill);
  return set('dateGroupColor', billDateColor)(bill);
};

const getBillDateColor = (state, bill: Bill) => {
  const key = moment(bill.date).format('DDMM');
  const color = state.billDateColorMap[key];
  if (!color) {
    const generatedColor = getRandomColor();
    state.billDateColorMap[key] = generatedColor;
    return generatedColor;
  }

  return color;
};

const canAddToMyBills = (bill: Bill) => {
  const currentUser = authStorage.getUser();
  if (currentUser.role === Role.ADMIN) {
    return true;
  }

  if (currentUser.role === Role.LICENSE) {
    return currentUser.id === bill.licenseUserId;
  }

  if (currentUser.role === Role.ACCOUNTANT) {
    if (bill.status === BILL_STATUS.ACCOUNTANT) {
      return true;
    }

    return currentUser.id === bill.accountantUserId;
  }

  return false;
};

export const { actions, reducer, name: sliceKey } = workspaceSlice;
