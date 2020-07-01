import { call, put, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { LoginAction } from './types';
import { authService } from 'app/services/auth';

export function* loginTask(action: PayloadAction<LoginAction>) {
  yield put(actions.setIsBeingLogin(true));

  try {
    const { email, password } = action.payload;
    yield call(authService.login, email, password);
    yield put(actions.setError(''));
  } catch (error) {
    const { message } = error;
    yield put(actions.setError(message));
  }

  yield put(actions.setIsBeingLogin(false));
}

export function* recoveryPasswordTask(
  action: PayloadAction<{ email: string; onSent: () => void }>,
) {
  let errorMsg: string = '';
  try {
    yield call(authService.recovery, action.payload.email);
    action.payload.onSent();
  } catch (error) {
    const { message } = error;
    errorMsg = message;
  }

  yield put(actions.recoveryPasswordCompleted(errorMsg));
}

export function* loginSaga() {
  yield takeLatest(actions.login.type, loginTask);
  yield takeLatest(actions.recoveryPassword.type, recoveryPasswordTask);
}
