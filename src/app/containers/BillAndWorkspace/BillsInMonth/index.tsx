/**
 *
 * BillsInMonth
 *
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import moment from 'moment';
import { Switch } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { RootContainer } from 'app/components/Layout';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import { actions, reducer, sliceKey } from './slice';
import { billsInMonthSaga } from './saga';
import { selectNeedToReload } from './selectors';
import BillList from '../components/BillList';
import type Bill from 'app/models/bill';

export const BillsInMonth = memo(() => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: billsInMonthSaga });

  const needToReload = useSelector(selectNeedToReload);
  const user = authStorage.getUser();
  const dispatch = useDispatch();

  const getQuery = useCallback(
    (isViewArchivedBills: boolean) => {
      let query = `Period  = "${moment().format('MM-YYYY')}"`;

      if (user.role === Role.SALE) {
        query = `${query} and saleUserId = "${user.id}"`;
      } else if (user.role === Role.LICENSE) {
        query = `${query} and licenseUserId = "${user.id}"`;
      }

      if (!isViewArchivedBills) {
        query = `${query} and IsArchived = false`;
      }

      return query;
    },
    [user.id, user.role],
  );

  const billDataSource = useMemo(() => {
    const billDataSource = getDataSource(FETCHER_KEY.BILL);
    billDataSource.orderByFields = 'date descending';
    billDataSource.query = getQuery(false);

    return billDataSource;
  }, [getQuery]);

  useEffect(() => {
    if (needToReload) {
      billDataSource.onReloadData();
      dispatch(actions.setNeedToReload(false));
    }
  }, [billDataSource, dispatch, needToReload]);

  const onArchiveBill = useCallback(
    (billId: string) => {
      dispatch(actions.archivedBill(billId));
    },
    [dispatch],
  );

  const onViewArchivedBillChanged = useCallback(
    checked => {
      billDataSource.query = getQuery(checked);
      billDataSource.onReloadData();
    },
    [billDataSource, getQuery],
  );

  const onCheckPrintedVat = useCallback(
    (bill: Bill) => {
      dispatch(actions.checkPrintedVatBill(bill));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <RootContainer title={`Danh sách Bill tháng ${moment().format('MM-YYYY')}`}>
      <Switch
        checkedChildren="Bao gồm bill đã hủy"
        unCheckedChildren="Đã loại trừ bill đã hủy"
        onChange={onViewArchivedBillChanged}
        style={{ marginBottom: 10, marginLeft: 10 }}
      ></Switch>
      <BillList
        billDataSource={billDataSource}
        onArchiveBill={onArchiveBill}
        onPrintedVatBill={onCheckPrintedVat}
      />
    </RootContainer>
  );
});
