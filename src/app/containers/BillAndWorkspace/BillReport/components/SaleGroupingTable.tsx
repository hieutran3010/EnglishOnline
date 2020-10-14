import React, { memo, useCallback } from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import isEmpty from 'lodash/fp/isEmpty';

import { SaleReport } from 'app/models/bill';
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
    title: 'Sale',
    dataIndex: 'saleName',
    key: 'saleName',
    width: 200,
    fixed: true,
    ...getLocalColumnSearchProps('saleName'),
  },
  {
    title: 'Tổng Bill',
    dataIndex: 'totalBill',
    key: 'totalBill',
    width: 100,
  },
  {
    title: 'Tổng Giá Bán',
    dataIndex: 'totalSalePrice',
    key: 'totalSalePrice',
    width: 150,
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Tổng Giá Mua',
    dataIndex: 'totalPurchase',
    key: 'totalPurchase',
    width: 150,
    render: value => <span>{toCurrency(value)}</span>,
  },
  {
    title: 'Lợi nhuận thô sau/trước thuế',
    key: 'rawProfit',
    width: 350,
    render: (record: SaleReport) => {
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
    render: (record: SaleReport) => {
      const { totalProfit } = record;
      return <span>{toCurrency(totalProfit)}</span>;
    },
  },
];

interface Props {
  dateRange: any[];
}
const SaleGroupingTable = ({
  dateRange,
  ...restProps
}: Props & TableProps<SaleReport>) => {
  const NestedBillsSaleGrouping = useCallback(
    (record: SaleReport) => {
      const isClear = isEmpty(dateRange);

      const billDataSource = getDataSource(FETCHER_KEY.BILL);

      if (!isClear) {
        const { saleUserId } = record;
        billDataSource.orderByFields = BILL_LIST_DEFAULT_ORDER;

        const queryCriteria = getDefaultReportQueryCriteria(dateRange);
        queryCriteria.push({
          field: 'SaleUserId',
          operator: GRAPHQL_QUERY_OPERATOR.EQUALS,
          value: saleUserId,
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
      expandable={{ expandedRowRender: NestedBillsSaleGrouping }}
      rowKey={(record: any) => record.vendorId}
      scroll={{ x: 1300, y: getMaxHeight() }}
      {...restProps}
    />
  );
};

export default memo(SaleGroupingTable);
