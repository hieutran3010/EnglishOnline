import { call, put, takeLatest } from 'redux-saga/effects';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';

import { actions } from './slice';
import UserFetcher from 'app/fetchers/userFetcher';
import User from 'app/models/user';

const userFetcher = new UserFetcher();
export function* fetchUsersTask() {
  yield put(actions.setIsFetchingUsers(true));

  const users = yield call(userFetcher.getMany);
  yield put(
    actions.fetchUserCompleted(
      map((u: User) => {
        u.phoneNumber = !isEmpty(u.phoneNumber)
          ? u.phoneNumber?.replace('+84', '0')
          : u.phoneNumber;
        return u;
      })(users),
    ),
  );

  yield put(actions.setIsFetchingUsers(false));
}

export function* userListSaga() {
  yield takeLatest(actions.fetchUsers.type, fetchUsersTask);
}
