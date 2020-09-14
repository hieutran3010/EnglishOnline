/**
 *
 * BillsInMonth
 *
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { Button, Form, DatePicker, Input } from 'antd';
import isEmpty from 'lodash/fp/isEmpty';
import { useSelector } from 'react-redux';

import { RootContainer } from 'app/components/Layout';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';

import { QueryCriteria } from 'app/collection-datasource/types';
import { parseQueryCriteriaToGraphQLDoorQuery } from 'app/collection-datasource/graphql/utils';
import { GRAPHQL_QUERY_OPERATOR } from 'app/collection-datasource/graphql/constants';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey } from './slice';
import { billAdvanceSearchSaga } from './saga';
import { selectNeedToReload } from './selectors';
import BillList from '../components/BillList';
import { useBillView } from '../BillViewPage/hook';

const { RangePicker } = DatePicker;

export const BillAdvanceSearch = memo(() => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: billAdvanceSearchSaga });
  useBillView();

  const user = authStorage.getUser();

  const needToReload = useSelector(selectNeedToReload);

  const [form] = Form.useForm();

  const billDataSource = useMemo(() => {
    const billDataSource = getDataSource(FETCHER_KEY.BILL);
    billDataSource.orderByFields = 'date descending';

    return billDataSource;
  }, []);

  useEffect(() => {
    if (needToReload) {
      billDataSource.onReloadData();
    }
  }, [billDataSource, needToReload]);

  const getQuery = useCallback(
    (filters: QueryCriteria[]) => {
      let query = '';
      if (!isEmpty(filters)) {
        query = parseQueryCriteriaToGraphQLDoorQuery(filters);
      }

      if (user.role === Role.SALE) {
        query = `${query} and saleUserId = "${user.id}"`;
      }

      return query;
    },
    [user.id, user.role],
  );

  const onClearFilter = useCallback(() => {
    form.resetFields();
    form.submit();
  }, [form]);

  const onSubmitFilter = useCallback(
    filterForm => {
      const submittedFilters: QueryCriteria[] = [];

      const { dateRange, senderName, receiverName } = filterForm;
      const [fromDate, toDate] = dateRange || [];

      if (!isEmpty(fromDate)) {
        submittedFilters.push({
          field: 'Date',
          operator: GRAPHQL_QUERY_OPERATOR.GTE,
          value: fromDate.format('YYYY-MM-DD 00:00:00'),
        });
      }

      if (!isEmpty(toDate)) {
        submittedFilters.push({
          field: 'Date',
          operator: GRAPHQL_QUERY_OPERATOR.LTE,
          value: toDate.format('YYYY-MM-DD 23:59:00'),
        });
      }

      if (!isEmpty(senderName)) {
        submittedFilters.push({
          field: 'SenderName@SenderNameNonUnicode',
          operator: GRAPHQL_QUERY_OPERATOR.CONTAINS,
          value: senderName,
        });
      }

      if (!isEmpty(receiverName)) {
        submittedFilters.push({
          field: 'ReceiverName@ReceiverNameNonUnicode',
          operator: GRAPHQL_QUERY_OPERATOR.CONTAINS,
          value: receiverName,
        });
      }

      billDataSource.query = getQuery(submittedFilters);
      if (!isEmpty(submittedFilters)) {
        billDataSource.onReloadData();
      } else {
      }
    },
    [billDataSource, getQuery],
  );

  return (
    <>
      <RootContainer title="Tìm kiếm Bill">
        <Form
          style={{ marginLeft: 20, marginRight: 20, marginBottom: 20 }}
          form={form}
          onFinish={onSubmitFilter}
          layout="inline"
        >
          <Form.Item
            label="Từ ngày - Đến ngày"
            name="dateRange"
            labelCol={{ span: 8 }}
          >
            <RangePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item
            label="Tên khách gởi"
            name="senderName"
            labelCol={{ span: 12 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tên người nhận"
            name="receiverName"
            labelCol={{ span: 12 }}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tìm!
            </Button>
            <Button style={{ margin: '0 8px' }} onClick={onClearFilter}>
              Reset
            </Button>
          </Form.Item>
        </Form>
        <BillList
          billDataSource={billDataSource}
          dontLoadInitialData={true}
          heightOffset={0.35}
          disableFilterFields={['senderName', 'receiverName']}
          excludeFields={['billDeliveryHistories']}
        />
      </RootContainer>
    </>
  );
});
