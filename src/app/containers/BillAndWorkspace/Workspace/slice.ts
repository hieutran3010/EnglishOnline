import findIndex from 'lodash/fp/findIndex';
import remove from 'lodash/fp/remove';
import { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from 'utils/@reduxjs/toolkit';
import type Vendor from 'app/models/vendor';
import User, { Role } from 'app/models/user';
import Bill from 'app/models/bill';

import { ContainerState } from './types';
import { BillParams } from 'app/models/appParam';
import { authStorage } from 'app/services/auth';

// The initial state of the Workspace container
export const initialState: ContainerState = {
  isFetchingVendor: false,
  vendors: [],

  isFetchingVendorCountries: false,
  vendorCountries: [],

  isSubmitting: false,
  bill: new Bill(),

  isFetchingResponsibilityUsers: false,
  users: [],

  isFetchingMyBills: false,
  myBills: [],

  isDeletingBill: false,
  isAssigningAccountant: false,
  isCalculatingPurchasePrice: false,
  isFinalBill: false,
  isAssigningLicense: false,
  billParams: new BillParams(),
  numberOfUncheckedVatBills: 0,

  isFetchingUnassignedBills: false,
  unassignedBills: [],
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setIsFetchingVendor(state, action: PayloadAction<boolean>) {
      state.isFetchingVendor = action.payload;
    },
    fetchVendor(state) {},
    fetchVendorCompleted(state, action: PayloadAction<Vendor[]>) {
      state.vendors = action.payload;
    },

    setIsFetchingVendorCountries(state, action: PayloadAction<boolean>) {
      state.isFetchingVendorCountries = action.payload;
    },
    fetchVendorCountries(state, action: PayloadAction<string>) {},
    fetchVendorCountriesCompleted(state, action: PayloadAction<string[]>) {
      state.vendorCountries = action.payload;
    },

    setIsSubmittingBill(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    submitBill(state, action: PayloadAction<Bill>) {},
    submitBillSuccess(state, action: PayloadAction<Bill>) {
      state.bill = action.payload;
    },

    setIsFetchingResponsibilityUsers(state, action: PayloadAction<boolean>) {
      state.isFetchingResponsibilityUsers = action.payload;
    },
    fetchResponsibilityUsers(state) {},
    fetchResponsibilityUsersCompleted(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },

    setIsAssigningAccountant(state, action: PayloadAction<boolean>) {
      state.isAssigningAccountant = action.payload;
    },
    assignToAccountant(state) {},

    setIsFetchingMyBills(state, action: PayloadAction<boolean>) {
      state.isFetchingMyBills = action.payload;
    },
    fetchMyBills(state) {},
    fetchMyBillsCompleted(state, action: PayloadAction<Bill[]>) {
      state.myBills = action.payload;
    },

    addToMyBill(state, action: PayloadAction<Bill>) {
      const bill = action.payload;
      if (canAddOrUpdateOnMyBills(bill)) {
        state.myBills.splice(0, 0, bill);
      }
    },
    updateToMyBill(state, action: PayloadAction<Bill>) {
      const bill = action.payload;
      if (canAddOrUpdateOnMyBills(bill)) {
        const billIndex = findIndex((b: Bill) => b.id === bill.id)(
          state.myBills,
        );
        state.myBills.splice(billIndex, 1, bill);
      }
    },
    deleteFromMyBill(state, action: PayloadAction<string>) {
      const billId = action.payload;
      state.myBills = remove((b: Bill) => b.id === billId)(state.myBills);
    },
    initNewBill(state) {
      state.bill = new Bill();
    },
    setIsDeletingBill(state, action: PayloadAction<boolean>) {
      state.isDeletingBill = action.payload;
    },
    deleteBill() {},

    setIsCalculatingPurchasePrice(state, action: PayloadAction<boolean>) {
      state.isCalculatingPurchasePrice = action.payload;
    },
    calculatePurchasePrice(state, action: PayloadAction<any>) {},

    setIsFinalBill(state, action: PayloadAction<boolean>) {
      state.isFinalBill = action.payload;
    },
    finalBill() {},

    setIsAssigningLicense(state, action: PayloadAction<boolean>) {
      state.isAssigningLicense = action.payload;
    },
    assignLicense() {},
    fetchBillParams() {},
    fetchBillParamsCompleted(state, action: PayloadAction<BillParams>) {
      state.billParams = action.payload;
    },
    fetchNumberOfUncheckedVatBill() {},
    fetchNumberOfUncheckedVatBillCompleted(
      state,
      action: PayloadAction<number>,
    ) {
      state.numberOfUncheckedVatBills = action.payload;
    },
    fetchUnassignedBills(state) {
      state.isFetchingUnassignedBills = true;
    },
    fetchUnassignedBillsCompleted(state, action: PayloadAction<Bill[]>) {
      state.unassignedBills = action.payload;
      state.isFetchingUnassignedBills = false;
    },
  },
});

const canAddOrUpdateOnMyBills = (bill: Bill): boolean => {
  const user = authStorage.getUser();
  if (user.role === Role.ACCOUNTANT) {
    return bill.accountantUserId === user.id;
  } else if (user.role === Role.LICENSE) {
    return bill.licenseUserId === user.id;
  } else if (user.role === Role.ADMIN) {
    return bill.licenseUserId === user.id || bill.accountantUserId === user.id;
  }

  return false;
};

export const { actions, reducer, name: sliceKey } = workspaceSlice;
