import { PayloadAction } from '@reduxjs/toolkit';
import { TableChangedEventArgs } from 'app/components/collection/DataGrid/types';
import Vendor from 'app/models/vendor';
import remove from 'lodash/fp/remove';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';

// The initial state of the ServiceList container
export const initialState: ContainerState = {
  isDeleting: false,
  isFetchingVendors: false,
  vendors: [],
  pageSize: 20,
};

const vendorListSlice = createSlice({
  name: 'vendorList',
  initialState,
  reducers: {
    fetchVendors(state, action: PayloadAction<TableChangedEventArgs>) {
      state.isFetchingVendors = true;
    },
    fetchVendorsCompleted(state, action: PayloadAction<Vendor[]>) {
      state.vendors = action.payload;
      state.isFetchingVendors = false;
    },

    setTotalVendor(state, action: PayloadAction<number>) {
      state.totalVendor = action.payload;
    },

    setIsDeleting(state, action: PayloadAction<boolean>) {
      state.isDeleting = action.payload;
    },
    deleteVendor(state, action: PayloadAction<string>) {},
    deleteVendorComplete(state, action: PayloadAction<string>) {
      const deletedVendorId = action.payload;
      state.vendors = remove((v: Vendor) => v.id === deletedVendorId)(
        state.vendors,
      );
    },
  },
});

export const { actions, reducer, name: sliceKey } = vendorListSlice;
