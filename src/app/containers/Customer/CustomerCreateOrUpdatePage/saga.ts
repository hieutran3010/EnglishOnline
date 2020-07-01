import { call, put, select, takeLatest } from 'redux-saga/effects';

import { PayloadAction } from '@reduxjs/toolkit';
import type Customer from 'app/models/customer';
import CustomerFetcher from 'app/fetchers/customerFetcher';
import { toast } from 'react-toastify';

import { actions } from './slice';
import { CustomerSubmitActionType } from './types';
import { selectCustomer } from './selectors';
import User, { Role } from 'app/models/user';
import UserFetcher from 'app/fetchers/userFetcher';

const customerFetcher = new CustomerFetcher();
const userFetcher = new UserFetcher();

export function* submitCustomerTask(
  payload: PayloadAction<CustomerSubmitActionType>,
) {
  yield put(actions.setIsSubmitting(true));

  const submitActionParams = payload.payload;
  try {
    const newCustomer = (yield call(
      customerFetcher.addAsync,
      submitActionParams.customer,
    )) as Customer;

    yield call(toast.success, `Đã lưu khách hàng ${newCustomer.name}`);

    // navigate to edit page
    submitActionParams.history.push(`/customerUpdating/${newCustomer.id}`);
  } catch (error) {
    yield call(toast.error, `Chưa lưu được khách hàng, vui lòng thử lại!`);
  }
  yield put(actions.setIsSubmitting(false));
}

export function* fetchCustomerTask(action: PayloadAction<string>) {
  yield put(actions.setIsFetchingCustomer(true));

  const customerId = action.payload;
  const customer = yield call(customerFetcher.queryOneAsync, {
    query: `Id = "${customerId}"`,
  });
  yield put(actions.fetchCustomerCompleted(customer));

  yield put(actions.setIsFetchingCustomer(false));
}

export function* updateCustomerTask(payload: PayloadAction<Customer>) {
  yield put(actions.setIsSubmitting(true));

  const customer = payload.payload;
  try {
    const currentCustomer = (yield select(selectCustomer)) as Customer;
    yield call(customerFetcher.updateAsync, currentCustomer.id, customer);

    yield call(toast.success, `Đã cập nhật khách hàng ${currentCustomer.name}`);
  } catch (error) {
    yield call(toast.error, `Chưa lưu được khách hàng, vui lòng thử lại!`);
  }
  yield put(actions.setIsSubmitting(false));
}

export function* fetchSaleUsersTask() {
  let saleUsers: User[] = [];
  try {
    saleUsers = yield call(userFetcher.getMany, undefined, {
      roles: [Role.SALE],
    });
  } catch (error) {
    //TODO: should log here
  }

  yield put(actions.fetchSaleUsersCompleted(saleUsers));
}

export function* customerCreateOrUpdatePageSaga() {
  yield takeLatest(actions.submitCustomer.type, submitCustomerTask);
  yield takeLatest(actions.fetchCustomer.type, fetchCustomerTask);
  yield takeLatest(actions.updateCustomer.type, updateCustomerTask);
  yield takeLatest(actions.fetchSaleUsers.type, fetchSaleUsersTask);
}
