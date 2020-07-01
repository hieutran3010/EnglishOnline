import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import Customer from 'app/models/customer';

import { ContainerState, CustomerSubmitActionType } from './types';
import User from 'app/models/user';

// The initial state of the CustomerCreateOrUpdatePage container
export const initialState: ContainerState = {
  isSubmitting: false,
  isFetchingCustomer: false,
  customer: new Customer(),

  isFetchingSaleUsers: false,
  saleUsers: [],
};

const customerCreateOrUpdatePageSlice = createSlice({
  name: 'customerCreateOrUpdatePage',
  initialState,
  reducers: {
    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    submitCustomer(state, action: PayloadAction<CustomerSubmitActionType>) {},

    setIsFetchingCustomer(state, action: PayloadAction<boolean>) {
      state.isFetchingCustomer = action.payload;
    },
    fetchCustomer(state, action: PayloadAction<string>) {},
    fetchCustomerCompleted(state, action: PayloadAction<Customer>) {
      state.customer = action.payload;
    },

    updateCustomer(state, action: PayloadAction<Customer>) {},

    fetchSaleUsers(state) {
      state.isFetchingSaleUsers = true;
    },
    fetchSaleUsersCompleted(state, action: PayloadAction<User[]>) {
      state.isFetchingSaleUsers = false;
      state.saleUsers = action.payload;
    },
  },
});

export const {
  actions,
  reducer,
  name: sliceKey,
} = customerCreateOrUpdatePageSlice;
