import { call, takeLatest, put } from 'redux-saga/effects';

import { PayloadAction } from '@reduxjs/toolkit';
import CustomerFetcher from 'app/fetchers/customerFetcher';
import { toast } from 'react-toastify';

import { actions } from './slice';

const customerFetcher = new CustomerFetcher();

export function* deleteCustomerTask(action: PayloadAction<string>) {
  const customerId = action.payload;
  try {
    yield call(customerFetcher.deleteAsync, customerId);
    yield call(toast.success, 'Đã xóa khách hàng!');
    yield put(actions.setNeedToReload(true));
  } catch (error) {
    // TODO: should log here
    yield call(toast.error, 'Chưa xóa được, vui lòng thử lại!');
    throw error;
  }
}

export function* customerListSaga() {
  yield takeLatest(actions.deleteCustomer.type, deleteCustomerTask);
}
