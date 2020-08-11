import { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from 'utils/@reduxjs/toolkit';
import type Vendor from 'app/models/vendor';
import User from 'app/models/user';
import Bill from 'app/models/bill';

import { ContainerState } from './types';
import { BillParams } from 'app/models/appParam';

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

  isDeletingBill: false,
  isAssigningAccountant: false,
  isCalculatingPurchasePrice: false,
  isFinalBill: false,
  isAssigningLicense: false,
  billParams: new BillParams(),
  numberOfUncheckedVatBills: 0,

  needToReloadWorkingBills: false,
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

    setNeedToReloadWorkingBills(state, action: PayloadAction<boolean>) {
      state.needToReloadWorkingBills = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = workspaceSlice;
