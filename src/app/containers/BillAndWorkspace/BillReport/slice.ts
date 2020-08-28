import isEmpty from 'lodash/fp/isEmpty';
import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';
import { CustomerStatistic, VendorStatistic } from 'app/models/bill';
import ExportSession from 'app/models/exportSession';

// The initial state of the BillReport container
export const initialState: ContainerState = {
  totalCustomerDebt: 0,
  totalProfit: 0,
  totalProfitBeforeTax: 0,
  totalRawProfit: 0,
  totalRawProfitBeforeTax: 0,
  totalRevenue: 0,
  totalSalePriceOfSale: 0,
  totalVendorDebt: 0,
  totalBillCount: 0,
  totalFinalBill: 0,
  isFetchingTotalCustomerDebt: false,
  isFetchingTotalProfit: false,
  isFetchingTotalRevenue: false,
  isFetchingTotalSalePrice: false,
  isFetchingTotalVendorDebt: false,
  isFetchingTotalBillCount: false,
  isFetchingTotalRawProfit: false,
  isFetchingTotalFinalBill: false,

  isFetchingCustomerGroupingList: false,
  billsGroupedByCustomer: [],

  isFetchingVendorGroupingList: false,
  billsGroupedByVendor: [],
  checkingExportSession: false,
};

const billReportSlice = createSlice({
  name: 'billReport',
  initialState,
  reducers: {
    fetchTotalSalePrice(state, action: PayloadAction<string>) {
      state.isFetchingTotalSalePrice = true;
    },
    fetchTotalSalePriceCompleted(state, action: PayloadAction<number>) {
      state.isFetchingTotalSalePrice = false;
      state.totalSalePriceOfSale = action.payload;
    },

    fetchTotalRevenue(state, action: PayloadAction<string>) {
      state.isFetchingTotalRevenue = true;
    },
    fetchTotalRevenueCompleted(state, action: PayloadAction<number>) {
      state.isFetchingTotalRevenue = false;
      state.totalRevenue = action.payload;
    },

    fetchCustomerDebt(state, action: PayloadAction<string>) {
      state.isFetchingTotalCustomerDebt = true;
    },
    fetchCustomerDebtCompleted(state, action: PayloadAction<number>) {
      state.isFetchingTotalCustomerDebt = false;
      state.totalCustomerDebt = action.payload;
    },

    fetchVendorDebt(state, action: PayloadAction<string>) {
      state.isFetchingTotalVendorDebt = true;
    },
    fetchVendorDebtCompleted(state, action: PayloadAction<number>) {
      state.isFetchingTotalVendorDebt = false;
      state.totalVendorDebt = action.payload;
    },

    fetchProfit(state, action: PayloadAction<string>) {
      state.isFetchingTotalProfit = true;
    },
    fetchProfitCompleted(
      state,
      action: PayloadAction<{
        totalProfitBeforeTax: number;
        totalProfit: number;
      }>,
    ) {
      state.isFetchingTotalProfit = false;
      state.totalProfit = action.payload.totalProfit;
      state.totalProfitBeforeTax = action.payload.totalProfitBeforeTax;
    },

    fetchRawProfit(state, action: PayloadAction<string>) {
      state.isFetchingTotalRawProfit = true;
    },
    fetchRawProfitCompleted(
      state,
      action: PayloadAction<{
        totalRawProfitBeforeTax: number;
        totalRawProfit: number;
      }>,
    ) {
      state.isFetchingTotalRawProfit = false;
      state.totalRawProfit = action.payload.totalRawProfit;
      state.totalRawProfitBeforeTax = action.payload.totalRawProfitBeforeTax;
    },

    fetchTotalBillCount(state, action: PayloadAction<string>) {
      state.isFetchingTotalBillCount = true;
    },
    fetchTotalBillCountCompleted(state, action: PayloadAction<number>) {
      state.isFetchingTotalBillCount = false;
      state.totalBillCount = action.payload;
    },

    fetchTotalFinalBill(state, action: PayloadAction<string>) {
      state.isFetchingTotalFinalBill = true;
    },
    fetchTotalFinalBillCompleted(state, action: PayloadAction<number>) {
      state.isFetchingTotalFinalBill = false;
      state.totalFinalBill = action.payload;
    },

    fetchBillsGroupedByVendor(state, action: PayloadAction<string>) {
      state.isFetchingVendorGroupingList = true;
    },
    fetchBillsGroupedByVendorCompleted(
      state,
      action: PayloadAction<VendorStatistic[]>,
    ) {
      state.billsGroupedByVendor = action.payload;
      state.isFetchingVendorGroupingList = false;
    },

    fetchBillsGroupedByCustomer(state, action: PayloadAction<string>) {
      state.isFetchingCustomerGroupingList = true;
    },
    fetchBillsGroupedByCustomerCompleted(
      state,
      action: PayloadAction<CustomerStatistic[]>,
    ) {
      state.billsGroupedByCustomer = action.payload;
      state.isFetchingCustomerGroupingList = false;
    },

    checkExportSession(state, action: PayloadAction<string>) {
      state.checkingExportSession = true;
    },
    checkExportSessionCompleted(
      state,
      action: PayloadAction<ExportSession | undefined>,
    ) {
      state.checkingExportSession = false;
      state.exportSession = action.payload;
    },
    requestBillExport(
      state,
      action: PayloadAction<{ query: string; note: string }>,
    ) {},
    requestBillExportCompleted(state, action: PayloadAction<string>) {
      const sessionId = action.payload;
      if (!isEmpty(sessionId)) {
        state.exportSession = new ExportSession();
      } else {
        state.exportSession = undefined;
      }
    },
    downloadBills() {},

    reset(state) {
      state.totalSalePriceOfSale = initialState.totalSalePriceOfSale;
      state.totalCustomerDebt = 0;
      state.totalProfit = 0;
      state.totalProfitBeforeTax = 0;
      state.totalRevenue = 0;
      state.totalVendorDebt = 0;
      state.totalBillCount = 0;
      state.totalFinalBill = 0;
      state.billsGroupedByCustomer = [];
      state.billsGroupedByVendor = [];
    },

    returnFinalBillToAccountant(state, action: PayloadAction<string>) {},
  },
});

export const { actions, reducer, name: sliceKey } = billReportSlice;
