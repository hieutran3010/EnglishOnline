import { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill from 'app/models/bill';
import { BillParams } from 'app/models/appParam';
import type Vendor from 'app/models/vendor';
import type User from 'app/models/user';

import { ContainerState } from './types';

// The initial state of the BillCreateOrUpdate container
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
};

const billCreateOrUpdateSlice = createSlice({
  name: 'billCreateOrUpdate',
  initialState,
  reducers: {
    setBill(state, action: PayloadAction<Bill>) {
      state.bill = new Bill(action.payload);
    },
    fetchVendor(state) {
      state.isFetchingVendor = true;
    },
    fetchVendorCompleted(state, action: PayloadAction<Vendor[]>) {
      state.vendors = action.payload;
      state.isFetchingVendor = false;
    },

    fetchVendorCountries(state, action: PayloadAction<string>) {
      state.isFetchingVendorCountries = true;
    },
    fetchVendorCountriesCompleted(state, action: PayloadAction<string[]>) {
      state.vendorCountries = action.payload;
      state.isFetchingVendorCountries = false;
    },

    submitBill(state, action: PayloadAction<Bill>) {
      state.isSubmitting = true;
    },
    submitBillSuccess(state, action: PayloadAction<Bill>) {
      state.bill = action.payload;
      state.isSubmitting = false;
    },

    fetchResponsibilityUsers(state) {
      state.isFetchingResponsibilityUsers = true;
    },
    fetchResponsibilityUsersCompleted(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
      state.isFetchingResponsibilityUsers = false;
    },

    assignToAccountant(state) {
      state.isAssigningAccountant = true;
    },
    assignToAccountantCompleted(state, action: PayloadAction<Bill>) {
      state.isAssigningAccountant = false;
    },

    deleteBill(state) {
      state.isDeletingBill = true;
    },
    deleteBillCompleted(state) {
      state.isDeletingBill = false;
    },

    setIsCalculatingPurchasePrice(state, action: PayloadAction<boolean>) {
      state.isCalculatingPurchasePrice = action.payload;
    },
    calculatePurchasePrice(state, action: PayloadAction<any>) {},

    finalBill(state) {
      state.isFinalBill = true;
    },
    finalBillCompleted(state) {
      state.isFinalBill = false;
    },

    assignLicense(state) {
      state.isAssigningLicense = true;
    },
    assignLicenseCompleted(state, action: PayloadAction<Bill>) {
      state.isAssigningLicense = false;
    },

    fetchBillParams() {},
    fetchBillParamsCompleted(state, action: PayloadAction<BillParams>) {
      state.billParams = action.payload;
    },

    resetState(state) {
      state = { ...initialState };
    },
  },
});

export const { actions, reducer, name: sliceKey } = billCreateOrUpdateSlice;
