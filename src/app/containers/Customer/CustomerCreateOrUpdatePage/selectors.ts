import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state.customerCreateOrUpdatePage || initialState;

export const selectIsSubmitting = createSelector(
  [selectDomain],
  customerCreateOrUpdatePageState =>
    customerCreateOrUpdatePageState.isSubmitting,
);

export const selectIsFetchingCustomer = createSelector(
  [selectDomain],
  customerCreateOrUpdatePageState =>
    customerCreateOrUpdatePageState.isFetchingCustomer,
);

export const selectCustomer = createSelector(
  [selectDomain],
  customerCreateOrUpdatePageState => customerCreateOrUpdatePageState.customer,
);

export const selectIsFetchingSaleUsers = createSelector(
  [selectDomain],
  customerCreateOrUpdatePageState =>
    customerCreateOrUpdatePageState.isFetchingSaleUsers,
);

export const selectSaleUsers = createSelector(
  [selectDomain],
  customerCreateOrUpdatePageState => customerCreateOrUpdatePageState.saleUsers,
);
