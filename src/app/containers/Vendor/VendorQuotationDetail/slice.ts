import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import Vendor from 'app/models/vendor';

import { ContainerState } from './types';

// The initial state of the VendorQuotationDetail container
export const initialState: ContainerState = {
  vendor: new Vendor(),
  isFetchingVendor: false,
  isSubmittingData: false,
  submitHasError: false,
};

const vendorQuotationDetailSlice = createSlice({
  name: 'vendorQuotationDetail',
  initialState,
  reducers: {
    fetchVendor(state, action: PayloadAction<string>) {},
    fetchVendorCompleted(state, action: PayloadAction<Vendor>) {
      state.vendor = action.payload;
    },
    indicateIsFetchingVendor(state, action: PayloadAction<boolean>) {
      state.isFetchingVendor = action.payload;
    },
    setIsSubmittingData(state, action: PayloadAction<boolean>) {
      state.isSubmittingData = action.payload;
    },
    submitData(state, action: PayloadAction<any[]>) {},
    setSubmitErrorState(state, action: PayloadAction<boolean>) {
      state.submitHasError = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = vendorQuotationDetailSlice;
