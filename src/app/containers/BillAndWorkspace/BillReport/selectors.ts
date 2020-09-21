import { createSelector } from '@reduxjs/toolkit';
import isEmpty from 'lodash/fp/isEmpty';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.billReport || initialState;

export const selectTotalSalePriceOfSale = createSelector(
  [selectDomain],
  billReportState => billReportState.totalSalePriceOfSale,
);

export const selectIsFetchingTotalSalePrice = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalSalePrice,
);

export const selectTotalRevenue = createSelector(
  [selectDomain],
  billReportState => billReportState.totalRevenue,
);

export const selectIsFetchingTotalRevenue = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalRevenue,
);

export const selectTotalCustomerDebt = createSelector(
  [selectDomain],
  billReportState => billReportState.totalCustomerDebt,
);

export const selectIsFetchingTotalCustomerDebt = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalCustomerDebt,
);

export const selectTotalProfit = createSelector(
  [selectDomain],
  billReportState => billReportState.totalProfit,
);

export const selectIsFetchingTotalProfit = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalProfit,
);

export const selectTotalRawProfitBeforeTax = createSelector(
  [selectDomain],
  billReportState => billReportState.totalRawProfitBeforeTax,
);

export const selectTotalRawProfit = createSelector(
  [selectDomain],
  billReportState => billReportState.totalRawProfit,
);

export const selectIsFetchingTotalRawProfit = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalRawProfit,
);

export const selectIsFetchingTotalBillCount = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalBillCount,
);

export const selectTotalBillCount = createSelector(
  [selectDomain],
  billReportState => billReportState.totalBillCount,
);

export const selectIsFetchingTotalFinalBill = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalFinalBill,
);

export const selectTotalFinalBill = createSelector(
  [selectDomain],
  billReportState => billReportState.totalFinalBill,
);

export const selectTotalVendorDebt = createSelector(
  [selectDomain],
  billReportState => billReportState.totalVendorDebt,
);

export const selectIsFetchingTotalVendorDebt = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalVendorDebt,
);

export const selectIsFetchingVendorGroupingList = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingVendorGroupingList,
);

export const selectBillsGroupedByVendor = createSelector(
  [selectDomain],
  billReportState => billReportState.billsGroupedByVendor,
);

export const selectIsFetchingCustomerGroupingList = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingCustomerGroupingList,
);

export const selectBillsGroupedByCustomer = createSelector(
  [selectDomain],
  billReportState => billReportState.billsGroupedByCustomer,
);

export const selectBillExportStatus = createSelector(
  [selectDomain],
  billReportState => {
    if (
      !billReportState.exportSession ||
      isEmpty(billReportState.exportSession)
    ) {
      return undefined;
    }

    return billReportState.exportSession.status;
  },
);

export const selectCheckingExportSession = createSelector(
  [selectDomain],
  billReportState => billReportState.checkingExportSession,
);

export const selectExportSession = createSelector(
  [selectDomain],
  billReportState => billReportState.exportSession,
);

export const selectDateRange = createSelector(
  [selectDomain],
  billReportState => billReportState.dateRange,
);

export const selectTotalCustomerPayment = createSelector(
  [selectDomain],
  billReportState => billReportState.totalCustomerPayment,
);

export const selectIsFetchingTotalCustomerPayment = createSelector(
  [selectDomain],
  billReportState => billReportState.isFetchingTotalCustomerPayment,
);
