import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState, SettingState } from './types';
import AppParam, { BillParams, APP_PARAM_KEY } from 'app/models/appParam';
import isEmpty from 'lodash/fp/isEmpty';
import { getAppParam, getAppParamIndex } from './utils';

// The initial state of the Setting container
export const initialState: ContainerState = {
  isFetchingAppParams: false,
  billParams: new BillParams(),
  appParams: [],
  isUpdatingBillParams: false,
};

const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    fetchAppParams(state) {
      state.isFetchingAppParams = true;
    },
    fetchAppParamsCompleted(state, action: PayloadAction<AppParam[]>) {
      state.isFetchingAppParams = false;
      state.appParams = action.payload;

      const billParams = new BillParams();
      billParams.vat = getAppParam(APP_PARAM_KEY.VAT, action.payload).value;
      billParams.usdExchangeRate = getAppParam(
        APP_PARAM_KEY.USD_EXCHANGE_RATE,
        action.payload,
      ).value;
      state.billParams = billParams;
    },

    updateBillParams(state, action: PayloadAction<BillParams>) {
      state.isUpdatingBillParams = true;
    },
    updateBillParamsCompleted(state, action: PayloadAction<AppParam[]>) {
      state.isUpdatingBillParams = false;

      if (!isEmpty(action.payload)) {
        addOrReplaceAppParam(state, APP_PARAM_KEY.VAT, action.payload);
        addOrReplaceAppParam(
          state,
          APP_PARAM_KEY.USD_EXCHANGE_RATE,
          action.payload,
        );
      }
    },
  },
});

const addOrReplaceAppParam = (
  state: SettingState,
  key: APP_PARAM_KEY,
  newAppParams: AppParam[],
) => {
  const index = getAppParamIndex(key, state.appParams);
  const param = getAppParam(key, newAppParams);
  if (index >= 0) {
    state.appParams.splice(index, 1, param);
  } else {
    state.appParams.push(param);
  }
};

export const { actions, reducer, name: sliceKey } = settingSlice;
