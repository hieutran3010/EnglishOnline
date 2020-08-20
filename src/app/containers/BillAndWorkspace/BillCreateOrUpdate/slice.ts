import { PayloadAction } from '@reduxjs/toolkit';
import flow from 'lodash/fp/flow';
import set from 'lodash/fp/set';

import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill from 'app/models/bill';
import { BillParams } from 'app/models/appParam';
import type Vendor from 'app/models/vendor';
import type User from 'app/models/user';

import { ContainerState } from './types';
import { PurchasePriceCountingResult } from 'app/models/purchasePriceCounting';

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

    calculatePurchasePrice(state, action: PayloadAction<any>) {
      state.isCalculatingPurchasePrice = true;
    },
    calculatePurchasePriceCompleted(
      state,
      action: PayloadAction<PurchasePriceCountingResult>,
    ) {
      const newBill = new Bill(state.bill);
      newBill.updatePurchasePriceInfo(action.payload);
      state.bill = newBill;

      state.isCalculatingPurchasePrice = false;
    },

    updateNewWeight(
      state,
      action: PayloadAction<{
        newWeight: number;
        predictPurchasePrice: PurchasePriceCountingResult;
      }>,
    ) {
      const newBill = new Bill({ ...state.bill });
      newBill.oldWeightInKg = newBill.weightInKg;
      newBill.weightInKg = action.payload.newWeight;
      newBill.updatePurchasePriceInfo(action.payload.predictPurchasePrice);

      state.bill = newBill;
    },
    restoreSaleWeight(
      state,
      action: PayloadAction<{
        saleWeight: number;
        purchasePrice: PurchasePriceCountingResult;
      }>,
    ) {
      const newBill = new Bill({ ...state.bill });
      newBill.oldWeightInKg = undefined;
      newBill.weightInKg = action.payload.saleWeight;
      newBill.updatePurchasePriceInfo(action.payload.purchasePrice);

      state.bill = newBill;
    },

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
