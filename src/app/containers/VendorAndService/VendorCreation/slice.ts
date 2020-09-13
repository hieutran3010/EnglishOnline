import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import Vendor from 'app/models/vendor';

import { ContainerState } from './types';
import type { SubmitVendorActionType } from './types';

// The initial state of the VendorCreation container
export const initialState: ContainerState = {
  isSubmitting: false,
  isFetchingVendor: false,
  vendor: new Vendor(),
};

const vendorCreationSlice = createSlice({
  name: 'vendorCreation',
  initialState,
  reducers: {
    submitVendor(state, action: PayloadAction<SubmitVendorActionType>) {},
    setIsSubmittingVendor(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    setIsFetchingVendor(state, action: PayloadAction<boolean>) {
      state.isFetchingVendor = action.payload;
    },
    fetchingVendor(state, action: PayloadAction<string>) {},
    fetchingVendorCompleted(state, action: PayloadAction<Vendor>) {
      state.vendor = action.payload;
    },
    updateVendor(state, action: PayloadAction<Vendor>) {},
  },
});

export const { actions, reducer, name: sliceKey } = vendorCreationSlice;
