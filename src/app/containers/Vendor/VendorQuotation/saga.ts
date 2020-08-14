import { call, put, takeLatest, select } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { PayloadAction } from '@reduxjs/toolkit';
import set from 'lodash/fp/set';
import flow from 'lodash/fp/flow';

import VendorFetcher from 'app/fetchers/vendorFetcher';
import ZoneFetcher from 'app/fetchers/zoneFetcher';
import Zone from 'app/models/zone';
import Vendor from 'app/models/vendor';

import { actions } from './slice';
import { selectVendor } from './selectors';

const vendorFetcher = new VendorFetcher();
const zoneFetcher = new ZoneFetcher();

export function* fetchVendorTask(action: PayloadAction<string>) {
  yield put(actions.indicateIsFetchingVendor(true));

  const vendorId = action.payload;
  const vendor = yield call(vendorFetcher.queryOneAsync, {
    query: `Id = "${vendorId}"`,
  });
  yield put(actions.fetchVendorCompleted(vendor));

  yield put(actions.indicateIsFetchingVendor(false));
}

export function* fetchZonesTask(action: PayloadAction<string>) {
  yield put(actions.indicateIsFetchingZones(true));

  const vendorId = action.payload;
  const zones = yield call(zoneFetcher.queryManyAsync, {
    query: `VendorId = "${vendorId}"`,
  });
  yield put(actions.fetchZonesCompleted(zones));

  yield put(actions.indicateIsFetchingZones(false));
}

export function* submitANewZoneTask(action: PayloadAction<Zone>) {
  const zone = action.payload;
  yield put(actions.indicateIsSubmittingZone(true));

  try {
    yield call(zoneFetcher.addAsync, zone);
    yield call(toast.success, `Zone ${zone.name} đã được lưu`);

    yield put(actions.indicateIsSubmittingZone(false));

    // refresh zone list
    const vendor = yield select(selectVendor);
    yield put(actions.fetchZones(vendor.id));
  } catch (error) {
    yield call(
      toast.error,
      `Zone  ${zone.name} chưa được lưu, vui lòng thử lại!`,
    );
  }

  yield put(actions.indicateIsSubmittingZone(false));
}

export function* deleteZoneTask(action: PayloadAction<Zone>) {
  const zone = action.payload;
  try {
    yield call(zoneFetcher.deleteAsync, zone.id);
    yield call(toast.success, `Zone ${zone.name} đã được xóa`);

    // refresh zone list
    const vendor = yield select(selectVendor);
    yield put(actions.fetchZones(vendor.id));
  } catch (error) {
    yield call(
      toast.error,
      `Zone ${zone.name} chưa được xóa, vui lòng thử lại!`,
    );
  }
}

export function* updateZoneTask(action: PayloadAction<Zone>) {
  const zone = action.payload;
  yield put(actions.indicateIsSubmittingZone(true));

  try {
    yield call(zoneFetcher.updateAsync, zone.id, zone);
    yield call(toast.success, `Zone ${zone.name} đã được cập nhật`);

    yield put(actions.indicateIsSubmittingZone(false));

    // refresh zone list
    const vendor = yield select(selectVendor);
    yield put(actions.fetchZones(vendor.id));
  } catch (error) {
    yield call(
      toast.error,
      `Zone ${zone.name} chưa được cập nhật, vui lòng thử lại sau`,
    );
  }

  yield put(actions.indicateIsSubmittingZone(false));
}

export function* updateVendorTask(action: PayloadAction<Vendor>) {
  const updatePatch = action.payload;
  yield put(actions.indicateIsEditingVendor(true));

  const currentVendor = yield select(selectVendor);
  const updatedModel = flow(
    set(
      'otherFeeInUsd',
      updatePatch.otherFeeInUsd || currentVendor.otherFeeInUsd,
    ),
    set('fuelChargePercent', updatePatch.fuelChargePercent),
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

  yield put(actions.indicateIsEditingVendor(false));
}

export function* vendorQuotationSaga() {
  yield takeLatest(actions.fetchVendor.type, fetchVendorTask);
  yield takeLatest(actions.submitANewZone.type, submitANewZoneTask);
  yield takeLatest(actions.fetchZones.type, fetchZonesTask);
  yield takeLatest(actions.deleteZone.type, deleteZoneTask);
  yield takeLatest(actions.updateZone.type, updateZoneTask);
  yield takeLatest(actions.updateVendor.type, updateVendorTask);
}
