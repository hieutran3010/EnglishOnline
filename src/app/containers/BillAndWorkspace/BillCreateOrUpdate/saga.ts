import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import flatten from 'lodash/fp/flatten';
import map from 'lodash/fp/map';
import isEmpty from 'lodash/fp/isEmpty';
import find from 'lodash/fp/find';
import set from 'lodash/fp/set';
import assign from 'lodash/fp/assign';
import omit from 'lodash/fp/omit';
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
import { selectBill, selectVendors } from './selectors';
import AppParamsFetcher from 'app/fetchers/appParamsFetcher';
import AppParam, { APP_PARAM_KEY, BillParams } from 'app/models/appParam';
import User from 'app/models/user';

const vendorFetcher = new VendorFetcher();
const billFetcher = new BillFetcher();
const userFetcher = new UserFetcher();
const customerFetcher = new CustomerFetcher();
const appParamFetcher = new AppParamsFetcher();

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
  let resultBill = action.payload;
  try {
    // check auto save customer
    const {
      isSaveSender,
      isSaveReceiver,
      senderId,
      receiverId,
      vendorId,
    } = resultBill;

    if (isSaveSender === true && !senderId) {
      const { senderName, senderPhone, senderAddress } = action.payload;

      const sender = yield call(customerFetcher.addAsync, {
        code: `${new Date().getTime()}`,
        name: senderName,
        phone: senderPhone,
        address: senderAddress,
      });
      resultBill.senderId = sender.id;
    }

    if (isSaveReceiver === true && !receiverId) {
      const { receiverName, receiverPhone, receiverAddress } = action.payload;
      const receiver = yield call(customerFetcher.addAsync, {
        code: `${new Date().getTime()}`,
        name: receiverName,
        phone: receiverPhone,
        address: receiverAddress,
      });
      resultBill.receiverId = receiver.id;
    }

    const vendors = (yield select(selectVendors)) as Vendor[];
    const vendor = find((v: Vendor) => v.id === vendorId)(vendors);
    resultBill.vendorName = vendor?.name || '';

    const currentBill = (yield select(selectBill)) as Bill;
    const isUpdate = !isEmpty(currentBill.id);

    resultBill = omit(['isSaveSender', 'isSaveReceiver'])(
      assign(currentBill)(resultBill),
    );
    if (isUpdate === true) {
      resultBill = yield call(
        billFetcher.updateAsync,
        currentBill.id,
        resultBill,
      );
    } else {
      resultBill = yield call(billFetcher.addAsync, resultBill);
    }

    toast.success('Đã lưu Bill');
  } catch (error) {
    toast.error('Chưa lưu được Bill, vui lòng thử lại!');
    Sentry.captureException(error);
  }

  yield put(actions.submitBillSuccess(new Bill(resultBill)));
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

export function* assignToAccountantTask() {
  yield put(actions.setIsAssigningAccountant(true));

  const bill = (yield select(selectBill)) as Bill;
  if (!bill || !bill.id || bill.status !== BILL_STATUS.LICENSE) {
    return;
  }

  try {
    yield call(billFetcher.assignToAccountant, bill.id);
    let submitBill = new Bill(set('status', BILL_STATUS.ACCOUNTANT)(bill));
    yield put(actions.submitBillSuccess(submitBill));
    toast.success('Đã chuyển Bill cho Kế Toán');
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.setIsAssigningAccountant(false));
}

export function* deleteBillTask() {
  yield put(actions.setIsDeletingBill(true));

  const bill = (yield select(selectBill)) as Bill;

  try {
    yield call(billFetcher.deleteAsync, bill.id);
    toast.success('Đã xóa Bill!');
    yield put(actions.submitBillSuccess(new Bill()));
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa xóa được Bill, vui lòng thử lại!');
  }

  yield put(actions.setIsDeletingBill(false));
}

export function* calculatePurchasePriceTask(action: PayloadAction<any>) {
  yield put(actions.setIsCalculatingPurchasePrice(true));

  try {
    const billForm = action.payload;

    const params = new PurchasePriceCountingParams();
    params.destinationCountry = billForm.destinationCountry;
    params.fuelChargePercent = billForm.vendorFuelChargePercent;
    params.otherFeeInUsd = billForm.vendorOtherFee;
    params.usdExchangeRate = billForm.usdExchangeRate;
    params.vat = billForm.vat;
    params.vendorId = billForm.vendorId;
    params.weightInKg = billForm.weightInKg;

    const result = (yield call(
      billFetcher.countPurchasePrice,
      params,
    )) as PurchasePriceCountingResult;

    const bill = new Bill({ ...(yield select(selectBill)), ...billForm });
    bill.purchasePriceInUsd = result.purchasePriceInUsd;
    bill.purchasePriceInVnd = result.purchasePriceInVnd;
    bill.vendorFuelChargeFeeInUsd = result.fuelChargeFeeInUsd;
    bill.vendorFuelChargeFeeInVnd = result.fuelChargeFeeInVnd;
    bill.quotationPriceInUsd = result.quotationPriceInUsd;
    bill.vendorNetPriceInUsd = result.vendorNetPriceInUsd;
    bill.zoneName = result.zoneName;
    bill.purchasePriceAfterVatInUsd = result.purchasePriceAfterVatInUsd;
    bill.purchasePriceAfterVatInVnd = result.purchasePriceAfterVatInVnd;

    yield put(actions.submitBillSuccess(bill));
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa tính được giá mua, vui lòng thử lại!');
  }

  yield put(actions.setIsCalculatingPurchasePrice(false));
}

export function* finalBillTask() {
  yield put(actions.setIsFinalBill(true));

  const bill = (yield select(selectBill)) as Bill;

  try {
    yield call(billFetcher.finalBill, bill.id);
    toast.success('Đã chốt bill!');
    yield put(actions.submitBillSuccess(new Bill()));
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.setIsFinalBill(false));
}

export function* assignLicenseTask() {
  yield put(actions.setIsAssigningLicense(true));

  const bill = (yield select(selectBill)) as Bill;

  try {
    let resultBill = yield call(
      billFetcher.updateAsync,
      bill.id,
      new Bill({ ...bill, status: BILL_STATUS.LICENSE }),
    );

    resultBill = new Bill(resultBill);
    toast.success('Đã chuyển Bill cho Chứng Từ!');
    yield put(actions.submitBillSuccess(resultBill));
  } catch (error) {
    Sentry.captureException(error);
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
}
