/**
 *
 * BillsInMonth
 *
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { Button, Form, DatePicker, Input } from 'antd';
import isEmpty from 'lodash/fp/isEmpty';
import { useDispatch, useSelector } from 'react-redux';

import { RootContainer } from 'app/components/Layout';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';

import { QueryCriteria } from 'app/collection-datasource/types';
import { parseQueryCriteriaToGraphQLDoorQuery } from 'app/collection-datasource/graphql/utils';
import { GRAPHQL_QUERY_OPERATOR } from 'app/collection-datasource/graphql/constants';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { billAdvanceSearchSaga } from './saga';
import { selectNeedToReload } from './selectors';
import BillList from '../components/BillList';
import Bill from 'app/models/bill';

const { RangePicker } = DatePicker;

export const BillAdvanceSearch = memo(() => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: billAdvanceSearchSaga });

  const dispatch = useDispatch();

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

  const onArchiveBill = useCallback(
    (billId: string) => {
      dispatch(actions.archiveBill(billId));
    },
    [dispatch],
  );

  const onCheckPrintedVat = useCallback(
    (bill: Bill) => {
      dispatch(actions.checkPrintedVatBill(bill));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onClearFilter = useCallback(() => {
    form.resetFields();
    form.submit();
  }, [form]);

  const onSubmitFilter = useCallback(
    filterForm => {
      const submittedFilters: QueryCriteria[] = [];

      const { dateRange, senderPhone, receiverAddress } = filterForm;
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

      if (!isEmpty(senderPhone)) {
        submittedFilters.push({
          field: 'SenderPhone',
          operator: GRAPHQL_QUERY_OPERATOR.CONTAINS,
          value: senderPhone,
        });
      }

      if (!isEmpty(receiverAddress)) {
        submittedFilters.push({
          field: 'ReceiverAddress',
          operator: GRAPHQL_QUERY_OPERATOR.CONTAINS,
          value: receiverAddress,
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
          name="advanced_search"
          className="ant-advanced-search-form"
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
            label="Số điện thoại người gởi"
            name="senderPhone"
            labelCol={{ span: 12 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa chỉ người nhận"
            name="receiverAddress"
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
          onArchiveBill={onArchiveBill}
          billDataSource={billDataSource}
          onPrintedVatBill={onCheckPrintedVat}
          dontLoadInitialData={true}
          heightOffset={0.35}
        />
      </RootContainer>
    </>
  );
});
