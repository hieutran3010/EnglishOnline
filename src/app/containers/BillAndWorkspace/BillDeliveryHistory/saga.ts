import { call, put, select, takeLatest } from 'redux-saga/effects';
import isEmpty from 'lodash/fp/isEmpty';
import groupBy from 'lodash/fp/groupBy';
import keys from 'lodash/fp/keys';
import orderBy from 'lodash/fp/orderBy';
import map from 'lodash/fp/map';
import moment from 'moment';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher from 'app/fetchers/billFetcher';

import { actions } from './slice';
import { BillDeliveryHistory } from 'app/models/bill';
import { GroupedHistory } from './types';

const billFetcher = new BillFetcher();

export function* fetchBillDeliveryHistoriesTask(action: PayloadAction<string>) {
  const billId = action.payload;
  const bill = yield call(
    billFetcher.queryOneAsync,
    {
      query: `Id = "${billId}"`,
    },
    ['billDeliveryHistories { date time status }'],
  );

  const { billDeliveryHistories } = bill;
  if (!isEmpty(billDeliveryHistories)) {
    const orderedHistories = orderBy('date')('desc')(billDeliveryHistories);

    const groupedByDate = groupBy((bdh: BillDeliveryHistory) => bdh.date)(
      orderedHistories,
    );

    const dates = keys(groupedByDate);
    const groupedHistories: GroupedHistory[] = map(
      (groupedKey: string): GroupedHistory => {
        const values = groupedByDate[groupedKey];

        const date =
          isEmpty(groupedKey) || groupedKey === 'null'
            ? null
            : moment(groupedKey).format('DD-MM-YYYY');

        const historyValues = orderBy('time')('desc')(
          values,
        ) as BillDeliveryHistory[];

        return { date: date, histories: historyValues };
      },
    )(dates);

    yield put(actions.fetchBillDeliveryHistoriesCompleted(groupedHistories));
  } else {
    yield put(actions.fetchBillDeliveryHistoriesCompleted([]));
  }
}

export function* billDeliveryHistorySaga() {
  yield takeLatest(
    actions.fetchBillDeliveryHistories.type,
    fetchBillDeliveryHistoriesTask,
  );
}
