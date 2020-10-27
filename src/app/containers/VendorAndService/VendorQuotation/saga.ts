import { call, put, takeLatest, select } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as Sentry from '@sentry/react';
import { PayloadAction } from '@reduxjs/toolkit';
import set from 'lodash/fp/set';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';

import VendorFetcher from 'app/fetchers/vendorFetcher';
import ZoneFetcher from 'app/fetchers/zoneFetcher';
import Zone from 'app/models/zone';
import Vendor from 'app/models/vendor';

import { actions } from './slice';
import { selectVendor } from './selectors';
import isEmpty from 'lodash/fp/isEmpty';
import isNil from 'lodash/fp/isNil';
import ParcelServiceFetcher, {
  ParcelServiceVendorFetcher,
} from 'app/fetchers/parcelServiceFetcher';
import ParcelService, { ParcelServiceVendor } from 'app/models/parcelService';

const vendorFetcher = new VendorFetcher();
const zoneFetcher = new ZoneFetcher();
const parcelServiceFetcher = new ParcelServiceFetcher();
const parcelServiceVendorAssociationFetcher = new ParcelServiceVendorFetcher();

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
    orderBy: 'name',
  });
  yield put(actions.fetchZonesCompleted(zones));

  yield put(actions.indicateIsFetchingZones(false));
}

export function* addOrUpdateZoneTask(action: PayloadAction<Zone>) {
  yield put(actions.indicateIsSubmittingZone(true));

  try {
    const zoneData = action.payload;
    const vendor = (yield select(selectVendor)) as Vendor;
    zoneData.vendorId = vendor.id;

    const { id } = zoneData || {};
    let zone: Zone | undefined = undefined;
    const isUpdate = !isEmpty(id) && !isNil(id);
    if (isUpdate) {
      // update
      zone = yield call(zoneFetcher.updateAsync, id, zoneData);
    } else {
      zone = yield call(zoneFetcher.addAsync, zoneData);
    }

    yield put(actions.addOrUpdateZoneCompleted({ zone, isUpdate }));
    toast.success('Đã lưu zone');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được zone');
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

export function* fetchParcelServiceTask() {
  let result: ParcelService[] = [];
  try {
    result = yield call(parcelServiceFetcher.queryManyAsync, {
      orderBy: 'isSystem desc,name',
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchParcelServicesCompleted(result));
}

export function* fetchAssignedParcelServicesTask(
  action: PayloadAction<string>,
) {
  const vendorId = action.payload;

  const assignments = yield call(
    parcelServiceVendorAssociationFetcher.queryManyAsync,
    {
      query: `VendorId = "${vendorId}"`,
    },
  );

  const assignedServices = map((as: ParcelServiceVendor) => as.parcelServiceId)(
    assignments,
  );

  yield put(actions.setAssignedParcelServices(assignedServices));
}

export function* submitSelectedServicesTask(action: PayloadAction<string[]>) {
  yield put(actions.setIsSubmittingSelectedService(true));

  const selectedServiceIds = action.payload;
  const vendor = yield select(selectVendor);

  try {
    const result = yield call(
      vendorFetcher.assignParcelServices,
      selectedServiceIds,
      vendor.id,
    );
    yield put(
      actions.submitSelectedServicesComplete({ selectedServiceIds, result }),
    );
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.setIsSubmittingSelectedService(false));
}

export function* vendorQuotationSaga() {
  yield takeLatest(actions.fetchVendor.type, fetchVendorTask);
  yield takeLatest(actions.addOrUpdateZone.type, addOrUpdateZoneTask);
  yield takeLatest(actions.fetchZones.type, fetchZonesTask);
  yield takeLatest(actions.deleteZone.type, deleteZoneTask);
  yield takeLatest(actions.updateVendor.type, updateVendorTask);
  yield takeLatest(actions.fetchParcelServices.type, fetchParcelServiceTask);
  yield takeLatest(
    actions.fetchAssignedServices.type,
    fetchAssignedParcelServicesTask,
  );
  yield takeLatest(
    actions.submitSelectedServices.type,
    submitSelectedServicesTask,
  );
}
