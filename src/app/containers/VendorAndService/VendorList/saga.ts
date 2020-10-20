import { PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { TableChangedEventArgs } from 'app/components/collection/DataGrid/types';
import VendorFetcher from 'app/fetchers/vendorFetcher';
import { toast } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';

const serviceFetcher = new VendorFetcher();
export function* deleteVendorTask(action: PayloadAction<string>) {
  yield put(actions.setIsDeleting(true));

  const vendorId = action.payload;

  try {
    yield call(serviceFetcher.deleteAsync, vendorId);
    yield put(actions.deleteVendorComplete(vendorId));
    toast.success('Đã xóa nhà cung cấp');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa xóa được nhà cung cấp');
  }

  yield put(actions.setIsDeleting(false));
}

export function* fetchVendorTask(action: PayloadAction<TableChangedEventArgs>) {
  const {} = action.payload;

  try {
  } catch (error) {}
}

export function* vendorListSaga() {
  yield takeLatest(actions.fetchVendors.type, fetchVendorTask);
  yield takeLatest(actions.deleteVendor.type, deleteVendorTask);
}
