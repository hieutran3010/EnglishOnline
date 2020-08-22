import React, { memo, useCallback } from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import isEmpty from 'lodash/fp/isEmpty';

import { VendorStatistic } from 'app/models/bill';
import { getLocalColumnSearchProps } from 'app/components/collection/DataGrid/SearchControls';
import { toCurrency } from 'utils/numberFormat';
import BillList from 'app/containers/BillAndWorkspace/components/BillList';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import {
  getDefaultReportQueryCriteria,
  getAdminCols,
} from 'app/containers/BillAndWorkspace/BillReport/utils';
import { GRAPHQL_QUERY_OPERATOR } from 'app/collection-datasource/graphql/constants';
import { parseQueryCriteriaToGraphQLDoorQuery } from 'app/collection-datasource/graphql/utils';

const columns = [
  {
    title: 'Tên NCC',
    dataIndex: 'vendorName',
    key: 'vendorName',
    ...getLocalColumnSearchProps('vendorName'),
  },
  {
    title: 'Tổng Số Bill',
    dataIndex: 'totalBill',
    key: 'totalBill',
  },
  {
    title: 'Tổng Giá Mua',
    dataIndex: 'totalPurchase',
    key: 'totalPurchase',
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Tổng Giá Bán',
    dataIndex: 'totalSalePrice',
    key: 'totalSalePrice',
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Đã Thanh Toán',
    key: 'totalPayment',
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
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Lợi nhuận thô sau thuế/trước thuế',
    key: 'profit',
    render: record => {
      const { totalProfit, totalProfitBeforeTax } = record;
      return (
        <span>
          {toCurrency(totalProfit)} / {toCurrency(totalProfitBeforeTax)}
        </span>
      );
    },
  },
];

interface Props {
  dateRange: any[];
}
const VendorGroupingTable = ({
  dateRange,
  ...restProps
}: Props & TableProps<VendorStatistic>) => {
  const NestedBillsVendorGrouping = useCallback(
    (record: VendorStatistic) => {
      const isClear = isEmpty(dateRange);

      const billDataSource = getDataSource(FETCHER_KEY.BILL);

      if (!isClear) {
        const { vendorId } = record;
        billDataSource.orderByFields = 'Date descending';

        const queryCriteria = getDefaultReportQueryCriteria(dateRange);
        queryCriteria.push({
          field: 'VendorId',
          operator: GRAPHQL_QUERY_OPERATOR.EQUALS,
          value: vendorId,
        });
        billDataSource.query = parseQueryCriteriaToGraphQLDoorQuery(
          queryCriteria,
        );

        return (
          <BillList
            billDataSource={billDataSource}
            isReset={isClear}
            excludeFields={['isArchived']}
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
      expandable={{ expandedRowRender: NestedBillsVendorGrouping }}
      rowKey={(record: any) => record.vendorId}
      {...restProps}
    />
  );
};

export default memo(VendorGroupingTable);
