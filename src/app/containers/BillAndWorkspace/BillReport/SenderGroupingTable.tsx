import React, { memo, useCallback } from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import isEmpty from 'lodash/fp/isEmpty';

import { CustomerStatistic } from 'app/models/bill';
import { toCurrency } from 'utils/numberFormat';
import { getLocalColumnSearchProps } from 'app/components/collection/DataGrid/SearchControls';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { getDefaultReportQueryCriteria, getAdminCols } from './utils';
import { GRAPHQL_QUERY_OPERATOR } from 'app/collection-datasource/graphql/constants';
import { parseQueryCriteriaToGraphQLDoorQuery } from 'app/collection-datasource/graphql/utils';
import BillList from '../components/BillList';

const columns = [
  {
    title: 'Tên Khách Gởi',
    dataIndex: 'senderName',
    key: 'senderName',
    ...getLocalColumnSearchProps('senderName'),
  },
  {
    title: 'Số ĐT Khách Gởi',
    dataIndex: 'senderPhone',
    key: 'senderPhone',
    ...getLocalColumnSearchProps('senderPhone'),
  },
  {
    title: 'Tổng Giá Bán',
    dataIndex: 'totalSalePrice',
    key: 'totalSalePrice',
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Đã Trả',
    dataIndex: 'totalPayment',
    key: 'totalPayment',
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Còn Nợ',
    dataIndex: 'totalDebt',
    key: 'totalDebt',
    render: value => <span>{toCurrency(value)}</span>,
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
        billDataSource.orderByFields = 'Date descending';

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
            excludeFields={['isArchived', 'status']}
            extendCols={getAdminCols()}
          />
        );
      }
    },
    [dateRange],
  );
  return (
    <Table
      className="components-table-demo-nested"
      columns={columns}
      expandable={{ expandedRowRender: NestedBillsCustomerGrouping }}
      rowKey={(record: any) => record.senderPhone}
      {...restProps}
    />
  );
};

export default memo(SenderGroupingTable);
