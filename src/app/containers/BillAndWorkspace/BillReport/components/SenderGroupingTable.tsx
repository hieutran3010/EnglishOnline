import React, { memo, useCallback } from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import isEmpty from 'lodash/fp/isEmpty';

import { CustomerStatistic } from 'app/models/bill';
import { toCurrency } from 'utils/numberFormat';
import { getLocalColumnSearchProps } from 'app/components/collection/DataGrid/SearchControls';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { getDefaultReportQueryCriteria, getAdminCols } from '../utils';
import { GRAPHQL_QUERY_OPERATOR } from 'app/collection-datasource/graphql/constants';
import { parseQueryCriteriaToGraphQLDoorQuery } from 'app/collection-datasource/graphql/utils';
import BillList from '../../components/BillList';
import { BILL_LIST_DEFAULT_ORDER } from '../../constants';

const columns = [
  {
    title: 'Tên Khách Gởi',
    key: 'senderName',
    width: 250,
    fixed: true,
    ...getLocalColumnSearchProps('senderName'),
    render: (record: CustomerStatistic) => (
      <span style={{ color: record.totalDebt > 0 ? 'red' : 'inherit' }}>
        {record.senderName}
      </span>
    ),
  },
  {
    title: 'SĐT Khách Gởi',
    dataIndex: 'senderPhone',
    key: 'senderPhone',
    width: 150,
    ...getLocalColumnSearchProps('senderPhone'),
  },
  {
    title: 'Tổng Bill',
    dataIndex: 'totalBill',
    key: 'totalBill',
    width: 100,
  },
  {
    title: 'Tổng Giá Mua',
    dataIndex: 'totalPurchase',
    key: 'totalPurchase',
    width: 150,
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Tổng Giá Bán',
    dataIndex: 'totalSalePrice',
    key: 'totalSalePrice',
    width: 150,
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Đã Trả',
    key: 'totalPayment',
    width: 450,
    render: record => {
      const {
        totalPayment,
        totalCashPayment,
        totalBankTransferPayment,
      } = record;
      return (
        <span>
          {toCurrency(totalPayment)} (TM: {toCurrency(totalCashPayment)} - CK:{' '}
          {toCurrency(totalBankTransferPayment)})
        </span>
      );
    },
  },
  {
    title: 'Còn Nợ',
    dataIndex: 'totalDebt',
    key: 'totalDebt',
    width: 150,
    render: value => (
      <span style={{ color: value > 0 ? 'red' : 'inherit' }}>
        {toCurrency(value)}
      </span>
    ),
  },
  {
    title: 'Lợi nhuận thô sau/trước thuế',
    key: 'rawProfit',
    width: 350,
    render: (record: CustomerStatistic) => {
      const { totalRawProfit, totalRawProfitBeforeTax } = record;
      return (
        <span>
          {toCurrency(totalRawProfit)} / {toCurrency(totalRawProfitBeforeTax)}
        </span>
      );
    },
  },
  {
    title: 'Lợi nhuận thực',
    key: 'profit',
    width: 200,
    render: (record: CustomerStatistic) => {
      const { totalProfit } = record;
      return <span>{toCurrency(totalProfit)}</span>;
    },
  },
];

interface Props {
  dateRange: any[];
}
const SenderGroupingTable = ({
  dateRange,
  ...restProps
}: Props & TableProps<CustomerStatistic>) => {
  const NestedBillsCustomerGrouping = useCallback(
    (record: CustomerStatistic) => {
      const isClear = isEmpty(dateRange);

      const billDataSource = getDataSource(FETCHER_KEY.BILL);

      if (!isClear) {
        const { senderName, senderPhone } = record;
        billDataSource.orderByFields = BILL_LIST_DEFAULT_ORDER;

        const queryCriteria = getDefaultReportQueryCriteria(dateRange);
        queryCriteria.push(
          ...[
            {
              field: 'SenderName',
              operator: GRAPHQL_QUERY_OPERATOR.EQUALS,
              value: senderName,
            },
            {
              field: 'SenderPhone',
              operator: GRAPHQL_QUERY_OPERATOR.EQUALS,
              value: senderPhone,
            },
          ],
        );
        billDataSource.query = parseQueryCriteriaToGraphQLDoorQuery(
          queryCriteria,
        );

        return (
          <BillList
            billDataSource={billDataSource}
            isReset={isClear}
            excludeFields={[
              'isArchived',
              'billDeliveryHistories',
              'senderName',
            ]}
            extendCols={getAdminCols()}
            heightOffset={0.7}
          />
        );
      }
    },
    [dateRange],
  );

  const getMaxHeight = useCallback(() => {
    const offset = window.innerHeight * 0.51;
    return window.innerHeight - offset;
  }, []);

  return (
    <Table
      size="small"
      className="components-table-demo-nested"
      columns={columns}
      expandable={{ expandedRowRender: NestedBillsCustomerGrouping }}
      rowKey={(record: any) => record.senderPhone}
      scroll={{ x: 1300, y: getMaxHeight() }}
      {...restProps}
    />
  );
};

export default memo(SenderGroupingTable);
