import { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill, { PurchasePriceInfo, BILL_STATUS } from 'app/models/bill';
import { BillParams } from 'app/models/appParam';
import type Vendor from 'app/models/vendor';
import type User from 'app/models/user';

import { ContainerState, SubmitBillAction } from './types';
import { PurchasePriceCountingResult } from 'app/models/purchasePriceCounting';

// The initial state of the BillCreateOrUpdate container
export const initialState: ContainerState = {
  isFetchingVendor: false,
  vendors: [],

  isFetchingVendorCountries: false,
  vendorCountries: [],

  isSubmitting: false,
  billId: '',
  purchasePriceInfo: new PurchasePriceInfo(),
  oldWeightInKg: undefined,
  billStatus: BILL_STATUS.LICENSE,

  isFetchingResponsibilityUsers: false,
  users: [],

  isDeletingBill: false,
  isAssigningAccountant: false,
  isCalculatingPurchasePrice: false,
  isFinalBill: false,
  isAssigningLicense: false,
  billParams: new BillParams(),
};

const extractBillInfo = (state: ContainerState, bill: Bill) => {
  state.billId = bill.id;
  state.purchasePriceInfo = bill.getPurchasePriceInfo();
  state.oldWeightInKg = bill.oldWeightInKg;
  state.billStatus = bill.status;
};

const billCreateOrUpdateSlice = createSlice({
  name: 'billCreateOrUpdate',
  initialState,
  reducers: {
    setBill(state, action: PayloadAction<Bill>) {
      const bill = action.payload;
      extractBillInfo(state, bill);
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
    submitBillSuccess(state, action: PayloadAction<Bill | undefined>) {
      if (action.payload) {
        extractBillInfo(state, action.payload);
      }

      state.isSubmitting = false;
    },

    fetchResponsibilityUsers(state) {
      state.isFetchingResponsibilityUsers = true;
    },
    fetchResponsibilityUsersCompleted(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
      state.isFetchingResponsibilityUsers = false;
    },

    assignToAccountant(state, action: PayloadAction<SubmitBillAction>) {
      state.isAssigningAccountant = true;
    },
    assignToAccountantCompleted(state, action: PayloadAction<Bill>) {
      state.billStatus = BILL_STATUS.ACCOUNTANT;
      state.isAssigningAccountant = false;
    },

    deleteBill(state) {
      state.isDeletingBill = true;
    },
    deleteBillCompleted(state) {
      state.oldWeightInKg = initialState.oldWeightInKg;
      state.billStatus = initialState.billStatus;
      state.purchasePriceInfo = initialState.purchasePriceInfo;
      state.billId = initialState.billId;

      state.isDeletingBill = false;
    },

    calculatePurchasePrice(state, action: PayloadAction<any>) {
      state.isCalculatingPurchasePrice = true;
    },
    calculatePurchasePriceCompleted(
      state,
      action: PayloadAction<PurchasePriceCountingResult>,
    ) {
      const newPurchasePriceInfo = {
        ...state.purchasePriceInfo,
      } as PurchasePriceInfo;

      newPurchasePriceInfo.updatePurchasePriceInfo(action.payload);
      state.purchasePriceInfo = newPurchasePriceInfo;

      state.isCalculatingPurchasePrice = false;
    },

    updateNewWeight(
      state,
      action: PayloadAction<{
        oldWeight: number;
        newWeight: number;
        predictPurchasePrice: PurchasePriceCountingResult;
      }>,
    ) {
      state.oldWeightInKg = action.payload.oldWeight;
      const newPurchasePriceInfo = {
        ...state.purchasePriceInfo,
      } as PurchasePriceInfo;

      newPurchasePriceInfo.updatePurchasePriceInfo(
        action.payload.predictPurchasePrice,
      );
      state.purchasePriceInfo = newPurchasePriceInfo;
    },
    restoreSaleWeight(
      state,
      action: PayloadAction<{
        saleWeight: number;
        purchasePrice: PurchasePriceCountingResult;
      }>,
    ) {
      state.oldWeightInKg = undefined;
      const newPurchasePriceInfo = {
        ...state.purchasePriceInfo,
      } as PurchasePriceInfo;

      newPurchasePriceInfo.updatePurchasePriceInfo(
        action.payload.purchasePrice,
      );
      state.purchasePriceInfo = newPurchasePriceInfo;
    },

    finalBill(state, action: PayloadAction<SubmitBillAction>) {
      state.isFinalBill = true;
    },
    finalBillCompleted(state) {
      extractBillInfo(state, new Bill());
      state.isFinalBill = false;
    },

    assignLicense(state, action: PayloadAction<SubmitBillAction>) {
      state.isAssigningLicense = true;
    },
    assignLicenseCompleted(state, action: PayloadAction<Bill | undefined>) {
      if (action.payload) {
        extractBillInfo(state, action.payload);
      }
      state.isAssigningLicense = false;
    },

    fetchBillParams() {},
    fetchBillParamsCompleted(state, action: PayloadAction<BillParams>) {
      state.billParams = action.payload;
    },

    setBillStatus(state, action: PayloadAction<BILL_STATUS>) {
      state.billStatus = action.payload;
    },

    resetState(state) {
      state = { ...initialState };
    },
  },
});

export const { actions, reducer, name: sliceKey } = billCreateOrUpdateSlice;
