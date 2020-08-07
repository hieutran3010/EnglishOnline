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

import { authStorage } from 'app/services/auth';
import VendorFetcher from 'app/fetchers/vendorFetcher';
import ZoneFetcher from 'app/fetchers/zoneFetcher';
import BillFetcher from 'app/fetchers/billFetcher';
import UserFetcher from 'app/fetchers/userFetcher';
import CustomerFetcher from 'app/fetchers/customerFetcher';
import type Zone from 'app/models/zone';
import type Vendor from 'app/models/vendor';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { Role } from 'app/models/user';
import {
  PurchasePriceCountingParams,
  PurchasePriceCountingResult,
} from 'app/models/purchasePriceCounting';

import { actions } from './slice';
import { selectBill, selectVendors } from './selectors';
import AppParamsFetcher from 'app/fetchers/appParamsFetcher';
import AppParam, { APP_PARAM_KEY, BillParams } from 'app/models/appParam';

const vendorFetcher = new VendorFetcher();
const billFetcher = new BillFetcher();
const userFetcher = new UserFetcher();
const customerFetcher = new CustomerFetcher();
const appParamFetcher = new AppParamsFetcher();

export function* fetchVendorTask() {
  yield put(actions.setIsFetchingVendor(true));

  const vendors = yield call(vendorFetcher.queryManyAsync, {
    query: `IsStopped == false`,
    orderBy: 'name',
  });
  yield put(actions.fetchVendorCompleted(vendors));

  yield put(actions.setIsFetchingVendor(false));
}

export function* fetchVendorCountriesTask(action: PayloadAction<string>) {
  yield put(actions.setIsFetchingVendorCountries(true));

  const vendorId = action.payload;
  const zoneFetcher = new ZoneFetcher();
  zoneFetcher.selectFields = ['countries'];
  const zones = yield call(zoneFetcher.queryManyAsync, {
    query: `VendorId = "${vendorId}"`,
  });

  const countries = flatten(map((z: Zone) => z.countries)(zones));
  yield put(actions.fetchVendorCountriesCompleted(countries));

  yield put(actions.setIsFetchingVendorCountries(false));
}

export function* submitBillTask(action: PayloadAction<Bill | any>) {
  yield put(actions.setIsSubmittingBill(true));

  try {
    var billForm = action.payload;

    // check auto save customer
    const {
      isSaveSender,
      isSaveReceiver,
      senderId,
      receiverId,
      vendorId,
    } = billForm;

    if (isSaveSender === true && !senderId) {
      const { senderName, senderPhone, senderAddress } = action.payload;

      const sender = yield call(customerFetcher.addAsync, {
        code: `${new Date().getTime()}`,
        name: senderName,
        phone: senderPhone,
        address: senderAddress,
      });
      billForm.senderId = sender.id;
    }

    if (isSaveReceiver === true && !receiverId) {
      const { receiverName, receiverPhone, receiverAddress } = action.payload;
      const receiver = yield call(customerFetcher.addAsync, {
        code: `${new Date().getTime()}`,
        name: receiverName,
        phone: receiverPhone,
        address: receiverAddress,
      });
      billForm.receiverId = receiver.id;
    }

    const vendors = (yield select(selectVendors)) as Vendor[];
    const vendor = find((v: Vendor) => v.id === vendorId)(vendors);
    billForm.vendorName = vendor?.name || '';

    const currentBill = (yield select(selectBill)) as Bill;
    const isUpdate = !isEmpty(currentBill.id);

    let resultBill = omit(['isSaveSender', 'isSaveReceiver'])(
      assign(currentBill)(billForm),
    );
    if (isUpdate === true) {
      resultBill = yield call(
        billFetcher.updateAsync,
        currentBill.id,
        resultBill,
      );
      yield put(actions.updateToMyBill(new Bill(resultBill)));
    } else {
      resultBill = yield call(billFetcher.addAsync, resultBill);
      yield put(actions.addToMyBill(new Bill(resultBill)));
    }

    toast.success('Đã lưu Bill');
    yield put(actions.submitBillSuccess(new Bill(resultBill)));
  } catch (error) {
    toast.error('Chưa lưu được Bill, vui lòng thử lại!');
  }

  yield put(actions.setIsSubmittingBill(false));
}

export function* fetchResponsibilityUsersTask() {
  yield put(actions.setIsFetchingResponsibilityUsers(true));

  const users = yield call(userFetcher.getMany);

  yield put(actions.fetchResponsibilityUsersCompleted(users));

  yield put(actions.setIsFetchingResponsibilityUsers(false));
}

export function* assignToAccountantTask() {
  yield put(actions.setIsAssigningAccountant(true));

  try {
    const bill = (yield select(selectBill)) as Bill;
    if (!bill || !bill.id || bill.status !== BILL_STATUS.LICENSE) {
      return;
    }

    yield call(billFetcher.assignToAccountant, bill.id);
    let submitBill = new Bill(set('status', BILL_STATUS.ACCOUNTANT)(bill));
    yield put(actions.submitBillSuccess(submitBill));
    yield put(actions.updateToMyBill(submitBill));
    toast.success('Đã chuyển Bill cho Kế Toán');
  } catch (error) {
    //TODO: should log here
  }

  yield put(actions.setIsAssigningAccountant(false));
}

export function* fetchMyBillsTask() {
  yield put(actions.setIsFetchingMyBills(true));

  const query = getMyBillsQuery();
  if (!isEmpty(query)) {
    const myBills = yield call(billFetcher.queryManyAsync, {
      query,
    });

    yield put(actions.fetchMyBillsCompleted(myBills));
  }

  yield put(actions.setIsFetchingMyBills(false));
}

export function* deleteBillTask() {
  yield put(actions.setIsDeletingBill(true));

  const bill = (yield select(selectBill)) as Bill;

  try {
    yield call(billFetcher.deleteAsync, bill.id);
    toast.success('Đã xóa Bill!');
    yield put(actions.deleteFromMyBill(bill.id));
    yield put(actions.submitBillSuccess(new Bill()));
  } catch (error) {
    //TODO: should log here
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
    //TODO: should log here
    toast.error('Chưa tính được giá mua, vui lòng thử lại!');
  }

  yield put(actions.setIsCalculatingPurchasePrice(false));
}

export function* finalBillTask() {
  yield put(actions.setIsFinalBill(true));

  const bill = (yield select(selectBill)) as Bill;
  yield call(billFetcher.finalBill, bill.id);
  yield put(actions.deleteFromMyBill(bill.id));
  toast.success('Đã chốt bill!');
  yield put(actions.submitBillSuccess(new Bill()));
  yield put(actions.setIsFinalBill(false));
}

export function* assignLicenseTask() {
  yield put(actions.setIsAssigningLicense(true));

  const bill = (yield select(selectBill)) as Bill;

  let resultBill = yield call(
    billFetcher.updateAsync,
    bill.id,
    new Bill({ ...bill, status: BILL_STATUS.LICENSE }),
  );

  resultBill = new Bill(resultBill);
  yield put(actions.updateToMyBill(resultBill));
  toast.success('Đã chuyển Bill cho Chứng Từ!');
  yield put(actions.submitBillSuccess(resultBill));

  yield put(actions.setIsAssigningLicense(false));
}

export function* fetchBillParamsTask() {
  const appParams = yield call(appParamFetcher.queryManyAsync, {
    query: `Key = "${APP_PARAM_KEY.VAT}" || Key = "${APP_PARAM_KEY.USD_EXCHANGE_RATE}"`,
  });

  if (!isEmpty(appParams)) {
    const billParams = new BillParams();
    billParams.vat = (find({ key: APP_PARAM_KEY.VAT })(
      appParams,
    ) as AppParam).value;
    billParams.usdExchangeRate = (find({
      key: APP_PARAM_KEY.USD_EXCHANGE_RATE,
    })(appParams) as AppParam).value;

    yield put(actions.fetchBillParamsCompleted(billParams));
  }
}

export function* fetchUnassignedBillsTask() {
  const query = getUnassignedBillsQuery();
  const unassignedBills = yield call(billFetcher.queryManyAsync, { query });

  yield put(actions.fetchUnassignedBillsCompleted(unassignedBills));
}

export function* fetchNumberOfUncheckedVatBillTask() {
  try {
    const result = yield call(
      billFetcher.countAsync,
      `IsArchived = false and Status = "${BILL_STATUS.DONE}" and Vat > 0 and IsPrintedVatBill = false`,
    );
    yield put(actions.fetchNumberOfUncheckedVatBillCompleted(result));
  } catch (error) {
    // TODO: should log here
  }
}

export function* workspaceSaga() {
  yield takeLatest(actions.fetchVendor.type, fetchVendorTask);
  yield takeLatest(actions.fetchVendorCountries.type, fetchVendorCountriesTask);
  yield takeLatest(actions.submitBill.type, submitBillTask);
  yield takeLatest(
    actions.fetchResponsibilityUsers.type,
    fetchResponsibilityUsersTask,
  );
  yield takeLatest(actions.assignToAccountant.type, assignToAccountantTask);
  yield takeLatest(actions.fetchMyBills.type, fetchMyBillsTask);
  yield takeLatest(actions.deleteBill.type, deleteBillTask);
  yield takeLatest(
    actions.calculatePurchasePrice.type,
    calculatePurchasePriceTask,
  );
  yield takeLatest(actions.finalBill.type, finalBillTask);
  yield takeLatest(actions.assignLicense.type, assignLicenseTask);
  yield takeLatest(actions.fetchBillParams.type, fetchBillParamsTask);
  yield takeLatest(
    actions.fetchNumberOfUncheckedVatBill.type,
    fetchNumberOfUncheckedVatBillTask,
  );
  yield takeLatest(actions.fetchUnassignedBills.type, fetchUnassignedBillsTask);
}

function getMyBillsQuery() {
  const user = authStorage.getUser();
  switch (user.role) {
    case Role.LICENSE: {
      return `Status != "${BILL_STATUS.DONE}" and LicenseUserId = "${user.id}"`;
    }
    case Role.ACCOUNTANT: {
      return `Status != "${BILL_STATUS.DONE}" and AccountantUserId = "${user.id}"`;
    }
    case Role.ADMIN: {
      return `Status != "${BILL_STATUS.DONE}" and (AccountantUserId = "${user.id}" || LicenseUserId = "${user.id}")`;
    }
    case Role.SALE: {
      return `Status != "${BILL_STATUS.DONE}" and SaleUserId = "${user.id}"`;
    }
    default: {
      return ``;
    }
  }
}

const getUnassignedBillsQuery = () => {
  const user = authStorage.getUser();
  switch (user.role) {
    case Role.LICENSE: {
      return `LicenseUserId = null and Status = "${BILL_STATUS.LICENSE}"`;
    }
    case Role.ACCOUNTANT: {
      return `AccountantUserId = null and Status = "${BILL_STATUS.ACCOUNTANT}"`;
    }
    case Role.ADMIN: {
      return `LicenseUserId = null || AccountantUserId = null`;
    }
    default: {
      return `Id = null`;
    }
  }
};
