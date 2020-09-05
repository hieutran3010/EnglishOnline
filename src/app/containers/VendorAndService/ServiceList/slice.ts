import { PayloadAction } from '@reduxjs/toolkit';
import ParcelService from 'app/models/parcelService';
import { createSlice } from 'utils/@reduxjs/toolkit';
import remove from 'lodash/fp/remove';
import { ContainerState } from './types';

// The initial state of the ServiceList container
export const initialState: ContainerState = {
  services: [],
  isWorkingOnServiceList: false,
};

const serviceListSlice = createSlice({
  name: 'serviceList',
  initialState,
  reducers: {
    fetchServices(state) {
      state.isWorkingOnServiceList = true;
    },
    fetchServicesCompleted(state, action: PayloadAction<ParcelService[]>) {
      state.services = action.payload;
      state.isWorkingOnServiceList = false;
    },
    setIsWorkingOnServiceList(state, action: PayloadAction<boolean>) {
      state.isWorkingOnServiceList = action.payload;
    },
    deleteService(state, action: PayloadAction<string>) {},
    deleteServiceCompleted(state, action: PayloadAction<string>) {
      const deletedId = action.payload;
      state.services = remove((s: ParcelService) => s.id === deletedId)(
        state.services,
      );
    },
  },
});

export const { actions, reducer, name: sliceKey } = serviceListSlice;
