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
import { BILL_LIST_DEFAULT_ORDER } from '../../constants';

const columns = [
  {
    title: 'Tên NCC',
    dataIndex: 'vendorName',
    key: 'vendorName',
    width: 200,
    fixed: true,
    ...getLocalColumnSearchProps('vendorName'),
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
    title: 'Đã Thanh Toán',
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
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Lợi nhuận thô sau/trước thuế',
    key: 'rawProfit',
    width: 350,
    render: (record: VendorStatistic) => {
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
    render: (record: VendorStatistic) => {
      const { totalProfit } = record;
      return <span>{toCurrency(totalProfit)}</span>;
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
        billDataSource.orderByFields = BILL_LIST_DEFAULT_ORDER;

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
            excludeFields={[
              'isArchived',
              'billDeliveryHistories',
              'vendorName',
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
      expandable={{ expandedRowRender: NestedBillsVendorGrouping }}
      rowKey={(record: any) => record.vendorId}
      scroll={{ x: 1300, y: getMaxHeight() }}
      {...restProps}
    />
  );
};

export default memo(VendorGroupingTable);
