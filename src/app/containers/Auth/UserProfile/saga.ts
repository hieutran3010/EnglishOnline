import { call, put, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { authService } from 'app/services/auth';
import { toast } from 'react-toastify';

export function* changePassTask(
  action: PayloadAction<{ newPass: string; onSuccess: () => void }>,
) {
  let errorMsg: string = '';
  try {
    yield call(authService.changePass, action.payload.newPass);
    action.payload.onSuccess();
  } catch (error) {
    const { message } = error;
    errorMsg = message;
  }
  yield put(actions.changePassCompleted(errorMsg));
  yield call(toast.success, 'Đã đổi mật khẩu!');
}

export function* userProfileSaga() {
  yield takeLatest(actions.changePass.type, changePassTask);
}
