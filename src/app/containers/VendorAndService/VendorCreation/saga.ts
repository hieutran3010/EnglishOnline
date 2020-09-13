import { call, put, takeLatest, select } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import flow from 'lodash/fp/flow';
import set from 'lodash/fp/set';

import { PayloadAction } from '@reduxjs/toolkit';
import VendorFetcher from 'app/fetchers/vendorFetcher';
import Vendor from 'app/models/vendor';

import { actions } from './slice';
import type { SubmitVendorActionType } from './types';
import { selectVendor } from './selectors';

var vendorFetcher = new VendorFetcher();

export function* fetchVendorTask(action: PayloadAction<string>) {
  yield put(actions.setIsFetchingVendor(true));

  const vendorId = action.payload;
  const vendor = yield call(vendorFetcher.queryOneAsync, {
    query: `Id = "${vendorId}"`,
  });
  yield put(actions.fetchingVendorCompleted(vendor));

  yield put(actions.setIsFetchingVendor(false));
}

export function* submitVendorTask(
  payload: PayloadAction<SubmitVendorActionType>,
) {
  yield put(actions.setIsSubmittingVendor(true));

  const action = payload.payload;
  try {
    const newVendor = (yield call(addVendorAsync, action.vendor)) as Vendor;
    yield call(toast.success, `Đã lưu nhà cung cấp ${action.vendor.name}`);

    // navigate to create quotation
    action.history.push(`/vendorQuotation/${newVendor.id}`);
  } catch (error) {
    yield call(
      toast.error,
      `Chưa lưu được nhà cung cấp ${action.vendor.name}, vui lòng thử lại!`,
    );
  }
  yield put(actions.setIsSubmittingVendor(false));
}

function addVendorAsync(vendor: Vendor) {
  return vendorFetcher.addAsync(vendor);
}

export function* updateVendorTask(action: PayloadAction<Vendor>) {
  const updatePatch = action.payload;
  yield put(actions.setIsSubmittingVendor(true));

  const currentVendor = yield select(selectVendor);
  const updatedModel = flow(
    set('name', updatePatch.name),
    set('officeAddress', updatePatch.officeAddress),
    set('phone', updatePatch.phone),
    set('isStopped', updatePatch.isStopped),
  )(currentVendor) as Vendor;

  try {
    yield call(vendorFetcher.updateAsync, updatedModel.id, updatedModel);
    yield call(toast.success, `Vendor ${updatedModel.name} đã được cập nhật`);
  } catch (error) {
    yield call(
      toast.error,
      `Vendor ${updatedModel.name} chưa được cập nhật, vui lòng thử lại sau`,
    );
  }

  yield put(actions.setIsSubmittingVendor(false));
}

export function* vendorCreationSaga() {
  yield takeLatest(actions.submitVendor.type, submitVendorTask);
  yield takeLatest(actions.fetchingVendor.type, fetchVendorTask);
  yield takeLatest(actions.updateVendor.type, updateVendorTask);
}
