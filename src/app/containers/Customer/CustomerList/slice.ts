import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';

import { ContainerState } from './types';

// The initial state of the CustomerCreateOrUpdatePage container
export const initialState: ContainerState = {
  needToReload: false,
};

const customerListSlice = createSlice({
  name: 'customerList',
  initialState,
  reducers: {
    deleteCustomer(state, action: PayloadAction<string>) {},
    setNeedToReload(state, action: PayloadAction<boolean>) {
      state.needToReload = action.payload;
    },
  },
});

export const { actions, reducer, name: sliceKey } = customerListSlice;
