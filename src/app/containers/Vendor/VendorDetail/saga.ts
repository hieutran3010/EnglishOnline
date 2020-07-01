import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import VendorFetcher from 'app/fetchers/vendorFetcher';
import { actions } from './slice';

const vendorFetcher = new VendorFetcher();
vendorFetcher.selectFields = [
  ...vendorFetcher.selectFields,
  'vendorQuotations {id startWeight endWeight zonePrices {zoneId priceInUsd}}',
  'zones {id name countries}',
];

export function* fetchVendorTask(action: PayloadAction<string>) {
  yield put(actions.indicateIsFetchingVendor(true));

  const vendorId = action.payload;
  const vendor = yield call(vendorFetcher.queryOneAsync, {
    query: `Id = "${vendorId}"`,
    include: 'Zones',
  });

  yield put(actions.fetchVendorCompleted(vendor));

  yield put(actions.indicateIsFetchingVendor(false));
}

export function* vendorDetailSaga() {
  yield takeLatest(actions.fetchVendor.type, fetchVendorTask);
}
