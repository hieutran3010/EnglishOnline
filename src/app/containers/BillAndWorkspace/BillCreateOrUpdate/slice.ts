import { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from 'utils/@reduxjs/toolkit';
import Bill, { PurchasePriceInfo, BILL_STATUS } from 'app/models/bill';
import { BillParams } from 'app/models/appParam';
import type Vendor from 'app/models/vendor';
import type User from 'app/models/user';

import { ContainerState, SubmitBillAction } from './types';
import {
  PurchasePriceCountingParams,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';
import Zone from 'app/models/zone';

// The initial state of the BillCreateOrUpdate container
export const initialState: ContainerState = {
  isFetchingVendor: false,
  vendors: [],

  isFetchingVendorCountries: false,
  vendorCountries: [],

  isSubmitting: false,
  bill: new Bill(),
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
  isFetchingServices: false,
  services: [],
  relatedZones: [],
};

const extractBillInfo = (state: ContainerState, billInfo: any) => {
  const bill = new Bill(billInfo);
  state.billId = bill.id;
  state.purchasePriceInfo = bill.getPurchasePriceInfo();
  state.oldWeightInKg = bill.oldWeightInKg;
  state.billStatus = bill.status;
  state.senderId = bill.senderId;
  state.receiverId = bill.receiverId;
  state.bill = bill;
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

    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    submitBill(state, action: PayloadAction<Bill>) {},
    submitBillCompleted(state, action: PayloadAction<Bill>) {
      extractBillInfo(state, action.payload);
    },

    fetchResponsibilityUsers(state) {
      state.isFetchingResponsibilityUsers = true;
    },
    fetchResponsibilityUsersCompleted(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
      state.isFetchingResponsibilityUsers = false;
    },

    setIsAssigningAccountant(state, action: PayloadAction<boolean>) {
      state.isAssigningAccountant = action.payload;
    },
    assignToAccountant(state, action: PayloadAction<SubmitBillAction>) {},
    assignToAccountantCompleted(state, action: PayloadAction<Bill>) {
      state.billStatus = BILL_STATUS.ACCOUNTANT;
    },

    setIsDeletingBill(state, action: PayloadAction<boolean>) {
      state.isDeletingBill = action.payload;
    },
    deleteBill() {},
    deleteBillCompleted(state) {
      state.oldWeightInKg = initialState.oldWeightInKg;
      state.billStatus = initialState.billStatus;
      state.purchasePriceInfo = initialState.purchasePriceInfo;
      state.billId = initialState.billId;
      state.senderId = initialState.senderId;
      state.receiverId = initialState.receiverId;
    },

    setIsCalculatingPurchasePrice(state, action: PayloadAction<boolean>) {
      state.isCalculatingPurchasePrice = action.payload;
    },
    calculatePurchasePrice(
      state,
      action: PayloadAction<{
        billForm: any;
        isGetLatestQuotation: boolean;
        callback?: any;
      }>,
    ) {},
    calculatePurchasePriceCompleted(
      state,
      action: PayloadAction<PurchasePriceInfo>,
    ) {
      state.purchasePriceInfo = action.payload;
    },

    updateNewWeight(
      state,
      action: PayloadAction<{
        oldWeight: number;
        newWeight: number;
        predictPurchasePrice: PurchasePriceCountingResult;
        isUseLatestQuotation: boolean;
      }>,
    ) {
      state.oldWeightInKg = action.payload.oldWeight;

      const newPurchasePriceInfo = new PurchasePriceInfo(
        state.purchasePriceInfo,
      );
      newPurchasePriceInfo.updateNewWeightPurchasePrice(
        action.payload.predictPurchasePrice,
        action.payload.newWeight,
        action.payload.oldWeight,
        action.payload.isUseLatestQuotation,
      );
      state.purchasePriceInfo = newPurchasePriceInfo;
    },
    restoreSaleWeight(
      state,
      action: PayloadAction<{
        saleWeight: number;
        purchasePrice: PurchasePriceCountingResult;
        isUseLatestQuotation: boolean;
      }>,
    ) {
      state.oldWeightInKg = undefined;

      const newPurchasePriceInfo = new PurchasePriceInfo(
        state.purchasePriceInfo,
      );
      newPurchasePriceInfo.restoreOldWeightPurchasePrice(
        action.payload.purchasePrice,
        action.payload.isUseLatestQuotation,
      );
      state.purchasePriceInfo = newPurchasePriceInfo;
    },

    setIsFinalBill(state, action: PayloadAction<boolean>) {
      state.isFinalBill = action.payload;
    },
    finalBill(state, action: PayloadAction<SubmitBillAction>) {},
    finalBillCompleted(state, action: PayloadAction<Bill>) {
      extractBillInfo(state, action.payload);
    },

    setIsAssigningLicense(state, action: PayloadAction<boolean>) {
      state.isAssigningLicense = action.payload;
    },
    assignLicense(state, action: PayloadAction<SubmitBillAction>) {},
    assignLicenseCompleted(state, action: PayloadAction<Bill>) {
      extractBillInfo(state, action.payload);
    },

    fetchBillParams() {},
    fetchBillParamsCompleted(state, action: PayloadAction<BillParams>) {
      state.billParams = action.payload;
    },

    setBillStatus(state, action: PayloadAction<BILL_STATUS>) {
      state.billStatus = action.payload;
    },
    setSenderId(state, action: PayloadAction<string | undefined>) {
      state.senderId = action.payload;
    },
    setReceiverId(state, action: PayloadAction<string | undefined>) {
      state.receiverId = action.payload;
    },
    setPurchasePriceManually(state, action: PayloadAction<PurchasePriceInfo>) {
      const newPurchasePriceInfo = new PurchasePriceInfo(action.payload);
      state.purchasePriceInfo = newPurchasePriceInfo;
    },
    fetchServices(state, action: PayloadAction<string>) {
      state.isFetchingServices = true;
    },
    fetchServicesCompleted(state, action: PayloadAction<string[]>) {
      state.services = action.payload;
      state.isFetchingServices = false;
    },
    fetchRelatedZones(
      state,
      action: PayloadAction<{ vendorId?: string; destinationCountry?: string }>,
    ) {},
    fetchRelatedZonesCompleted(state, action: PayloadAction<Zone[]>) {
      state.relatedZones = action.payload;
    },

    resetState(state) {
      state.vendorCountries = [];
      state.isFetchingVendor = false;
      state.vendors = [];

      state.isFetchingVendorCountries = false;
      state.vendorCountries = [];

      state.isSubmitting = false;
      state.bill = new Bill();
      state.billId = '';
      state.purchasePriceInfo = new PurchasePriceInfo();
      state.oldWeightInKg = undefined;
      state.billStatus = BILL_STATUS.LICENSE;
      state.isFetchingResponsibilityUsers = false;
      state.users = [];
      state.isDeletingBill = false;
      state.isAssigningAccountant = false;
      state.isCalculatingPurchasePrice = false;
      state.isFinalBill = false;
      state.isAssigningLicense = false;
    },
  },
});

export const { actions, reducer, name: sliceKey } = billCreateOrUpdateSlice;
