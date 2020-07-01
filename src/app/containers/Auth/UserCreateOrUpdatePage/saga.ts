import { toast } from 'react-toastify';

import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import User from 'app/models/user';

import { actions } from './slice';
import UserFetcher from 'app/fetchers/userFetcher';
import isEmpty from 'lodash/fp/isEmpty';

const userFetcher = new UserFetcher();

export function* createUserTask(action: PayloadAction<User>) {
  yield put(actions.setIsSubmitting(true));

  try {
    const user = action.payload;
    user.phoneNumber = !isEmpty(user.phoneNumber)
      ? `+84${user.phoneNumber}`
      : user.phoneNumber;
    yield call(userFetcher.post, user);
    yield call(toast.success, 'Một người dùng mới đã được thêm');
    yield put(actions.setError(''));
  } catch (error) {
    const { message } = error;
    yield put(actions.setError(message));
  }

  yield put(actions.setIsSubmitting(false));
}

export function* fetchUserTask(action: PayloadAction<string>) {
  const userId = action.payload;

  try {
    const user = yield call(userFetcher.get, userId);
    user.phoneNumber = !isEmpty(user.phoneNumber)
      ? user.phoneNumber.replace('+84', '0')
      : user.phoneNumber;
    yield put(actions.fetchUserCompleted(user));
  } catch (error) {
    yield call(
      toast.error,
      'Không lấy được thông tin người dùng, vui lòng thử lại!',
    );
  }
}

export function* updateUserTask(action: PayloadAction<User>) {
  yield put(actions.setIsSubmitting(true));

  try {
    const user = action.payload;
    user.phoneNumber = !isEmpty(user.phoneNumber)
      ? `+84${user.phoneNumber}`
      : user.phoneNumber;
    yield call(userFetcher.patch, user, user.id);
    yield call(toast.success, 'Đã cập nhật!');
    yield put(actions.setError(''));
  } catch (error) {
    const { message } = error;
    yield put(actions.setError(message));
  }

  yield put(actions.setIsSubmitting(false));
}

export function* userCreateOrUpdatePageSaga() {
  yield takeLatest(actions.createUser.type, createUserTask);
  yield takeLatest(actions.fetchUser.type, fetchUserTask);
  yield takeLatest(actions.updateUser.type, updateUserTask);
}
