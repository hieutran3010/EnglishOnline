import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';
import Vendor from 'app/models/vendor';

// The initial state of the VendorDetail container
export const initialState: ContainerState = {
  isFetchingVendor: false,
  vendor: new Vendor(),
};

const vendorDetailSlice = createSlice({
  name: 'vendorDetail',
  initialState,
  reducers: {
    fetchVendor(state, action: PayloadAction<string>) {},
    fetchVendorCompleted(state, action: PayloadAction<Vendor>) {
      state.vendor = action.payload;
    },
    indicateIsFetchingVendor(state, action: PayloadAction<boolean>) {
      state.isFetchingVendor = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = vendorDetailSlice;
