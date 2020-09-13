import { call, put, takeLatest, select } from 'redux-saga/effects';
import * as Sentry from '@sentry/react';
import { toast } from 'react-toastify';
import { isNil, isEmpty, assign, omit } from 'lodash';
import { PayloadAction } from '@reduxjs/toolkit';

import { actions } from './slice';

import ParcelServiceFetcher, {
  ParcelServiceZoneFetcher,
} from 'app/fetchers/parcelServiceFetcher';
import ParcelService, { ParcelServiceZone } from 'app/models/parcelService';
import { selectParcelService } from './selectors';

const parcelServiceZoneFetcher = new ParcelServiceZoneFetcher();
const parcelServiceFetcher = new ParcelServiceFetcher();

export function* fetchZonesTask(action: PayloadAction<string>) {
  const parcelServiceId = action.payload;
  let result: ParcelServiceZone[] = [];
  try {
    result = yield call(parcelServiceZoneFetcher.queryManyAsync, {
      query: `ParcelServiceId = "${parcelServiceId}"`,
      orderBy: 'name',
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchZonesCompleted(result));
}

export function* createNewServiceTask(
  action: PayloadAction<{ serviceData: any; history: any }>,
) {
  yield put(actions.setIsSubmittingService(true));

  try {
    const { serviceData, history } = action.payload;
    const newService = yield call(parcelServiceFetcher.addAsync, serviceData);
    toast.success('Đã lưu dịch vụ');
    history.push(`/serviceUpdating/${newService.id}`);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được dịch vụ, vui lòng thử lại');
  }

  yield put(actions.setIsSubmittingService(false));
}

export function* updateServiceTask(action: PayloadAction<any>) {
  yield put(actions.setIsSubmittingService(true));

  const serviceData = action.payload;
  const editingParcelService = yield select(selectParcelService);
  let latestService = omit(assign({ ...editingParcelService }, serviceData), [
    'isSystem',
  ]) as ParcelService;
  try {
    latestService = yield call(
      parcelServiceFetcher.updateAsync,
      editingParcelService.id,
      latestService,
    );
    toast.success('Đã lưu dịch vụ');
    yield put(actions.updateServiceCompleted(latestService));
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được dịch vụ, vui lòng thử lại');
  }

  yield put(actions.setIsSubmittingService(false));
}

export function* fetchParcelServiceTask(action: PayloadAction<string>) {
  const parcelServiceId = action.payload;

  let result: ParcelService | undefined = undefined;
  try {
    result = yield call(parcelServiceFetcher.queryOneAsync, {
      query: `Id = "${parcelServiceId}"`,
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchParcelServiceCompleted(result));
}

export function* addOrUpdateZoneTask(action: PayloadAction<ParcelServiceZone>) {
  yield put(actions.setIsSubmittingZone(true));

  try {
    const zoneData = action.payload;
    const parcelService = (yield select(selectParcelService)) as ParcelService;
    zoneData.parcelServiceId = parcelService.id;

    const { id } = zoneData || {};
    let zone: ParcelServiceZone | undefined = undefined;
    const isUpdate = !isEmpty(id) && !isNil(id);
    if (isUpdate) {
      // update
      zone = yield call(parcelServiceZoneFetcher.updateAsync, id, zoneData);
    } else {
      zone = yield call(parcelServiceZoneFetcher.addAsync, zoneData);
    }

    yield put(actions.addOrUpdateZoneCompleted({ zone, isUpdate }));
    toast.success('Đã lưu zone');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được zone');
  }

  yield put(actions.setIsSubmittingZone(false));
}

export function* deleteZoneTask(action: PayloadAction<ParcelServiceZone>) {
  const zone = action.payload;

  try {
    const { id } = zone;
    yield call(parcelServiceZoneFetcher.deleteAsync, id);
    yield put(actions.deleteZoneCompleted(id));
    toast.success('Đã xóa zone');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa xóa được zone');
  }
}

export function* serviceCreateOrUpdateSaga() {
  yield takeLatest(actions.fetchZones.type, fetchZonesTask);
  yield takeLatest(actions.createNewService.type, createNewServiceTask);
  yield takeLatest(actions.updateService.type, updateServiceTask);
  yield takeLatest(actions.fetchParcelService.type, fetchParcelServiceTask);
  yield takeLatest(actions.addOrUpdateZone.type, addOrUpdateZoneTask);
  yield takeLatest(actions.deleteZone.type, deleteZoneTask);
}
