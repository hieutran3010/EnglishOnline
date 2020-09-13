import { PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import ParcelServiceFetcher from 'app/fetchers/parcelServiceFetcher';
import ParcelService from 'app/models/parcelService';
import { toast } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';

const serviceFetcher = new ParcelServiceFetcher([
  'parcelServiceZones {id name countries} parcelServiceVendors {vendor {id name}}',
]);
export function* deleteServiceTask(action: PayloadAction<string>) {
  yield put(actions.setIsWorkingOnServiceList(true));

  const serviceId = action.payload;

  try {
    yield call(serviceFetcher.deleteAsync, serviceId);
    yield put(actions.deleteServiceCompleted(serviceId));
    toast.success('Đã xóa dịch vụ');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa xóa được dịch vụ');
  }

  yield put(actions.setIsWorkingOnServiceList(false));
}

export function* fetchServicesTask() {
  let result: ParcelService[] = [];
  try {
    result = yield call(serviceFetcher.queryManyAsync, {
      orderBy: 'isSystem desc,name',
      include: 'ParcelServiceZones,ParcelServiceVendors.Vendor',
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchServicesCompleted(result));
}

export function* serviceListSaga() {
  yield takeLatest(actions.fetchServices.type, fetchServicesTask);
  yield takeLatest(actions.deleteService.type, deleteServiceTask);
}
