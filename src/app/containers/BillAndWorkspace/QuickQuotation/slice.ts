import { PayloadAction } from '@reduxjs/toolkit';
import { BillParams } from 'app/models/appParam';
import SaleQuotationRate from 'app/models/saleQuotationRate';
import { QuotationReport, QuotationReportParams } from 'app/models/vendor';
import findIndex from 'lodash/fp/findIndex';
import isEmpty from 'lodash/fp/isEmpty';
import remove from 'lodash/fp/remove';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';

// The initial state of the QuickQuotation container
export const initialState: ContainerState = {
  isFetchingQuotation: false,
  quotationReports: [],

  isFetchingSaleRate: false,
  saleRates: [],

  isSubmittingSaleRate: false,
  isDeletingSaleRate: false,
};

const quickQuotationSlice = createSlice({
  name: 'quickQuotation',
  initialState,
  reducers: {
    fetchQuotationReports(state, action: PayloadAction<QuotationReportParams>) {
      state.isFetchingQuotation = true;
    },
    fetchQuotationReportsCompleted(
      state,
      action: PayloadAction<QuotationReport[]>,
    ) {
      state.quotationReports = action.payload;
      state.isFetchingQuotation = false;
    },
    fetchBillParams() {},
    fetchBillParamsCompleted(state, action: PayloadAction<BillParams>) {
      state.billParams = action.payload;
    },
    fetchSaleQuotationRates(state) {
      state.isFetchingSaleRate = true;
    },
    fetchSaleQuotationRatesCompleted(
      state,
      action: PayloadAction<SaleQuotationRate[]>,
    ) {
      state.saleRates = action.payload;
      state.isFetchingSaleRate = false;
    },

    setIsSubmittingSaleRate(state, action: PayloadAction<boolean>) {
      state.isSubmittingSaleRate = action.payload;
    },
    submitSaleRate(
      state,
      action: PayloadAction<{ saleRate: SaleQuotationRate; callback?: any }>,
    ) {},
    submitSaleRateCompleted(state, action: PayloadAction<SaleQuotationRate>) {
      const saleRate = action.payload;
      const { id } = saleRate;
      const existedIndex = findIndex((sr: SaleQuotationRate) => sr.id === id)(
        state.saleRates,
      );
      if (existedIndex >= 0) {
        // update
        state.saleRates.splice(existedIndex, 1, saleRate);
      } else {
        state.saleRates.push(saleRate);
      }
    },
    deleteSaleRate(
      state,
      action: PayloadAction<{ saleRate: SaleQuotationRate; callback?: any }>,
    ) {
      state.isDeletingSaleRate = true;
    },
    deleteSaleRateCompleted(state, action: PayloadAction<string[]>) {
      const deletedIds = action.payload;
      if (!isEmpty(deletedIds)) {
        state.saleRates = remove((sr: SaleQuotationRate) =>
          deletedIds.includes(sr.id),
        )(state.saleRates);
      }
      state.isDeletingSaleRate = false;
    },
  },
});

export const { actions, reducer, name: sliceKey } = quickQuotationSlice;
