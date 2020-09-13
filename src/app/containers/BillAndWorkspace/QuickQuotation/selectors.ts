import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.quickQuotation || initialState;

export const selectIsFetchingQuotation = createSelector(
  [selectDomain],
  quickQuotationState => quickQuotationState.isFetchingQuotation,
);

export const selectQuotationReports = createSelector(
  [selectDomain],
  quickQuotationState => quickQuotationState.quotationReports,
);

export const selectBillParams = createSelector(
  [selectDomain],
  quickQuotationState => quickQuotationState.billParams,
);

export const selectSaleRates = createSelector(
  [selectDomain],
  quickQuotationState => quickQuotationState.saleRates,
);

export const selectIsFetchingSaleRates = createSelector(
  [selectDomain],
  quickQuotationState => quickQuotationState.isFetchingSaleRate,
);

export const selectIsSubmittingSaleRate = createSelector(
  [selectDomain],
  quickQuotationState => quickQuotationState.isSubmittingSaleRate,
);

export const selectIsDeletingSaleRate = createSelector(
  [selectDomain],
  quickQuotationState => quickQuotationState.isDeletingSaleRate,
);
