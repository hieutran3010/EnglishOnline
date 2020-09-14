import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import flatten from 'lodash/fp/flatten';
import map from 'lodash/fp/map';
import isEmpty from 'lodash/fp/isEmpty';
import find from 'lodash/fp/find';
import isUndefined from 'lodash/fp/isUndefined';
import assign from 'lodash/fp/assign';
import omit from 'lodash/fp/omit';
import trim from 'lodash/fp/trim';
import * as Sentry from '@sentry/react';

import VendorFetcher from 'app/fetchers/vendorFetcher';
import ZoneFetcher from 'app/fetchers/zoneFetcher';
import BillFetcher from 'app/fetchers/billFetcher';
import UserFetcher from 'app/fetchers/userFetcher';
import CustomerFetcher from 'app/fetchers/customerFetcher';
import type Zone from 'app/models/zone';
import type Vendor from 'app/models/vendor';
import Bill, { BILL_STATUS } from 'app/models/bill';
import {
  PurchasePriceCountingParams,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';

import { actions } from './slice';
import {
  selectBillId,
  selectOldWeightInKg,
  selectPurchasePriceInfo,
  selectBillStatus,
  selectBill,
  selectSenderId,
  selectReceiverId,
} from './selectors';
import AppParamsFetcher from 'app/fetchers/appParamsFetcher';
import AppParam, { APP_PARAM_KEY, BillParams } from 'app/models/appParam';
import User from 'app/models/user';
import { SubmitBillAction } from './types';
import { isNil, trimStart } from 'lodash';
import { ParcelServiceVendorFetcher } from 'app/fetchers/parcelServiceFetcher';

const vendorFetcher = new VendorFetcher();
const billFetcher = new BillFetcher();
const userFetcher = new UserFetcher();
const customerFetcher = new CustomerFetcher();
const appParamFetcher = new AppParamsFetcher();
const serviceAndVendorAssociationFetcher = new ParcelServiceVendorFetcher([
  'parcelService {name}',
]);
const zoneFetcher = new ZoneFetcher();

export function* fetchVendorTask() {
  let vendors: Vendor[] = [];
  try {
    vendors = yield call(vendorFetcher.queryManyAsync, {
      query: `IsStopped == false`,
      orderBy: 'name',
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchVendorCompleted(vendors));
}

export function* fetchVendorCountriesTask(action: PayloadAction<string>) {
  const vendorId = action.payload;
  const zoneFetcher = new ZoneFetcher();
  zoneFetcher.selectFields = ['countries'];

  let countries: string[] = [];
  try {
    const zones = yield call(zoneFetcher.queryManyAsync, {
      query: `VendorId = "${vendorId}"`,
    });
    countries = flatten(map((z: Zone) => z.countries)(zones));
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchVendorCountriesCompleted(countries));
}

export function* submitBillTask(action: PayloadAction<Bill | any>) {
  yield put(actions.setIsSubmitting(true));

  let billFormValues = action.payload;
  try {
    // check auto save customer
    const {
      isSaveSender,
      isSaveReceiver,
      senderId,
      receiverId,
    } = billFormValues;

    if (isSaveSender === true && !senderId) {
      const { senderName, senderPhone, senderAddress } = billFormValues;
      const sender = yield call(
        getCustomer,
        senderName,
        senderPhone,
        senderAddress,
      );
      const senderId = sender ? sender.id : undefined;
      billFormValues.senderId = senderId;
      yield put(actions.setSenderId(senderId));
    }

    if (isSaveReceiver === true && !receiverId) {
      const { receiverName, receiverPhone, receiverAddress } = billFormValues;
      const receiver = yield call(
        getCustomer,
        receiverName,
        receiverPhone,
        receiverAddress,
      );
      const receiverId = receiver ? receiver.id : undefined;
      billFormValues.receiverId = receiverId;
      yield put(actions.setReceiverId(receiverId));
    }

    const billId = yield select(selectBillId);
    const isUpdate = !isEmpty(billId);

    let bill = yield call(mergeBillFormWithStore, billFormValues);
    if (isUpdate === true) {
      bill = yield call(billFetcher.updateAsync, billId, bill);
    } else {
      bill = yield call(billFetcher.addAsync, bill);
    }

    yield put(actions.submitBillCompleted(bill));
    toast.success('Đã lưu Bill');
    yield put(actions.setIsSubmitting(false));
    return bill;
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được Bill, vui lòng thử lại!');
  }

  yield put(actions.setIsSubmitting(false));
  return undefined;
}

export function* fetchResponsibilityUsersTask() {
  let users: User[] = [];
  try {
    users = yield call(userFetcher.getMany);
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchResponsibilityUsersCompleted(users));
}

export function* assignToAccountantTask(
  action: PayloadAction<SubmitBillAction>,
) {
  const { billFormValues, isDirty } = action.payload;
  if (isDirty) {
    const bill = yield call(submitBillTask, {
      payload: billFormValues,
      type: '',
    });
    if (isUndefined(bill)) {
      return;
    }
  }

  yield put(actions.setIsAssigningAccountant(true));

  try {
    const billId = yield select(selectBillId);
    const submittedBill = yield call(billFetcher.assignToAccountant, billId);
    yield put(actions.assignToAccountantCompleted(submittedBill));
    toast.success('Đã chuyển Bill cho Kế Toán');
  } catch (error) {
    toast.error('Chưa chuyển được bill cho Kế Toán, vui lòng thử lại!');
    Sentry.captureException(error);
  }

  yield put(actions.setIsAssigningAccountant(false));
}

export function* deleteBillTask() {
  yield put(actions.setIsDeletingBill(true));

  const billId = yield select(selectBillId);

  try {
    yield call(billFetcher.deleteAsync, billId);
    yield put(actions.deleteBillCompleted());
    toast.success('Đã xóa Bill!');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa xóa được Bill, vui lòng thử lại!');
  }

  yield put(actions.setIsDeletingBill(false));
}

export function* calculatePurchasePriceTask(
  action: PayloadAction<{
    billForm: any;
    isGetLatestQuotation: boolean;
    callback?: any;
  }>,
) {
  yield put(actions.setIsCalculatingPurchasePrice(true));

  try {
    const { billForm, isGetLatestQuotation, callback } = action.payload;

    const purchasePrice = yield select(selectPurchasePriceInfo);

    const params = new PurchasePriceCountingParams(billForm);
    params.isGetLatestQuotation = isGetLatestQuotation;
    params.billQuotations = purchasePrice.billQuotations || [];

    const result = (yield call(
      billFetcher.countPurchasePrice,
      params,
    )) as PurchasePriceCountingResult;
    yield put(
      actions.calculatePurchasePriceCompleted({
        result,
        isGetLatestQuotation,
      }),
    );
    callback && callback(result);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa tính được giá mua, vui lòng thử lại!');
  }

  yield put(actions.setIsCalculatingPurchasePrice(false));
}

export function* finalBillTask(action: PayloadAction<SubmitBillAction>) {
  const { billFormValues, isDirty } = action.payload;
  if (isDirty) {
    const bill = yield call(submitBillTask, {
      payload: billFormValues,
      type: '',
    });
    if (isUndefined(bill)) {
      return;
    }
  }

  yield put(actions.setIsFinalBill(true));

  const billId = yield select(selectBillId);
  try {
    const bill = yield call(billFetcher.finalBill, billId);
    toast.success('Đã chốt bill!');
    yield put(actions.finalBillCompleted(bill));
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa chốt được bill, vui lòng thử lại!');
  }

  yield put(actions.setIsFinalBill(false));
}

export function* assignLicenseTask(action: PayloadAction<SubmitBillAction>) {
  yield put(actions.setIsAssigningLicense(true));

  const { billFormValues } = action.payload;
  try {
    let bill = yield call(mergeBillFormWithStore, billFormValues);
    bill.status = BILL_STATUS.LICENSE;

    const billId = yield select(selectBillId);
    bill = yield call(billFetcher.updateAsync, billId, bill);
    yield put(actions.assignLicenseCompleted(bill));
    toast.success('Đã chuyển Bill cho Chứng Từ!');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa chuyển được bill cho Chứng Từ, vui lòng thử lại!');
  }

  yield put(actions.setIsAssigningLicense(false));
}

export function* fetchBillParamsTask() {
  const billParams = new BillParams();

  try {
    const appParams = yield call(appParamFetcher.queryManyAsync, {
      query: `Key = "${APP_PARAM_KEY.VAT}" || Key = "${APP_PARAM_KEY.USD_EXCHANGE_RATE}"`,
    });

    if (!isEmpty(appParams)) {
      billParams.vat = (find({ key: APP_PARAM_KEY.VAT })(
        appParams,
      ) as AppParam).value;
      billParams.usdExchangeRate = (find({
        key: APP_PARAM_KEY.USD_EXCHANGE_RATE,
      })(appParams) as AppParam).value;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchBillParamsCompleted(billParams));
}

export function* fetchServicesTask(action: PayloadAction<string>) {
  const vendorId = action.payload;
  let services: string[] = [];
  try {
    const result = yield call(
      serviceAndVendorAssociationFetcher.queryManyAsync,
      {
        query: `VendorId = "${vendorId}"`,
        include: `ParcelService`,
      },
    );

    services = map((sv: any) => sv.parcelService.name)(result);
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchServicesCompleted(services));
}

export function* fetchRelatedZonesTask(
  action: PayloadAction<{ vendorId: string; destinationCountry: string }>,
) {
  const { vendorId, destinationCountry } = action.payload;

  let zones: Zone[] = [];

  if (
    !isEmpty(vendorId) &&
    !isEmpty(destinationCountry) &&
    !isNil(vendorId) &&
    !isNil(destinationCountry)
  ) {
    try {
      zones = yield call(
        zoneFetcher.getZoneByVendorAndCountry,
        vendorId,
        destinationCountry,
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  yield put(actions.fetchRelatedZonesCompleted(zones));
}

function* mergeBillFormWithStore(billFormValues: any) {
  const bill = new Bill(billFormValues);
  bill.oldWeightInKg = yield select(selectOldWeightInKg);
  bill.status = yield select(selectBillStatus);
  bill.senderId = yield select(selectSenderId);
  bill.receiverId = yield select(selectReceiverId);
  bill.updatePurchasePriceInfo(yield select(selectPurchasePriceInfo));

  const cachedBill = yield select(selectBill);
  const result = assign(cachedBill)(omit(['isPrintedVatBill'])(bill));

  return omit(['vendorName'])(result);
}

function* getCustomer(name: string, phone: string, address: string) {
  if (!name || !phone || isEmpty(name) || isEmpty(phone)) {
    return undefined;
  }

  let customer = yield call(customerFetcher.queryOneAsync, {
    query: `Phone = "${trim(phone)}"`,
  });
  if (!customer) {
    const formattedName = trimStart(name, '- ');
    customer = yield call(customerFetcher.addAsync, {
      name: trim(formattedName),
      phone,
      address: trim(address),
    });
  }

  return customer;
}

export function* billCreateOrUpdateSaga() {
  yield takeLatest(actions.fetchVendor.type, fetchVendorTask);
  yield takeLatest(actions.fetchVendorCountries.type, fetchVendorCountriesTask);
  yield takeLatest(actions.submitBill.type, submitBillTask);
  yield takeLatest(
    actions.fetchResponsibilityUsers.type,
    fetchResponsibilityUsersTask,
  );
  yield takeLatest(actions.assignToAccountant.type, assignToAccountantTask);
  yield takeLatest(actions.deleteBill.type, deleteBillTask);
  yield takeLatest(
    actions.calculatePurchasePrice.type,
    calculatePurchasePriceTask,
  );
  yield takeLatest(actions.finalBill.type, finalBillTask);
  yield takeLatest(actions.assignLicense.type, assignLicenseTask);
  yield takeLatest(actions.fetchBillParams.type, fetchBillParamsTask);
  yield takeLatest(actions.fetchServices.type, fetchServicesTask);
  yield takeLatest(actions.fetchRelatedZones.type, fetchRelatedZonesTask);
}
