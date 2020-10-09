/**
 *
 * BillsInMonth
 *
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import moment from 'moment';
import { Switch, Space, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { isMobile } from 'react-device-detect';

import { ContentContainer } from 'app/components/Layout';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import { actions, reducer, sliceKey } from './slice';
import { billsInMonthSaga } from './saga';
import { selectSelectedMonth, selectIsViewArchivedBills } from './selectors';
import BillList from '../components/BillList';
import { toFullString } from 'utils/numberFormat';
import { useBillView } from '../BillViewPage/hook';
import BillsInMonthSelection from '../components/BillsInMonthSelection';

const { Text } = Typography;

export const BillsInMonth = memo(() => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: billsInMonthSaga });
  useBillView();

  const user = authStorage.getUser();
  const dispatch = useDispatch();

  const selectedMonth = useSelector(selectSelectedMonth);
  const isViewArchivedBills = useSelector(selectIsViewArchivedBills);

  const getQuery = useCallback(() => {
    let query = `Period  = "${toFullString(selectedMonth)}-${moment().format(
      'YYYY',
    )}"`;

    if (user.role === Role.SALE) {
      query = `${query} and saleUserId = "${user.id}"`;
    }

    if (!isViewArchivedBills) {
      query = `${query} and IsArchived = false`;
    }

    return query;
  }, [isViewArchivedBills, selectedMonth, user.id, user.role]);

  const billDataSource = useMemo(() => {
    const billDataSource = getDataSource(FETCHER_KEY.BILL, [
      'billDeliveryHistories {date time status}',
    ]);
    billDataSource.orderByFields = 'date desc, createdOn desc';
    billDataSource.query = getQuery();

    return billDataSource;
  }, [getQuery]);

  useEffect(() => {
    billDataSource.onReloadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewArchivedBills, selectedMonth]);

  const onViewArchivedBillChanged = useCallback(
    checked => {
      dispatch(actions.setIsViewArchivedBills(checked));
    },
    [dispatch],
  );

  const onMonthChanged = useCallback(
    value => {
      dispatch(actions.setSelectedMonth(value));
    },
    [dispatch],
  );

  return (
    <ContentContainer
      title={
        <Space>
          <Text>Danh sách Bill tháng</Text>
          <BillsInMonthSelection
            selectedMonth={selectedMonth}
            onMonthChanged={onMonthChanged}
          />
        </Space>
      }
      bodyStyle={isMobile ? { height: '100%', overflow: 'auto' } : undefined}
    >
      <Switch
        checkedChildren="Bao gồm bill đã hủy"
        unCheckedChildren="Đã loại trừ bill đã hủy"
        onChange={onViewArchivedBillChanged}
        style={{ marginBottom: 10, marginLeft: 10 }}
      ></Switch>
      <BillList billDataSource={billDataSource} supportBuiltInSearch />
    </ContentContainer>
  );
});
