import React from 'react';
import { QueryCriteria } from 'app/collection-datasource/types';
import { GRAPHQL_QUERY_OPERATOR } from 'app/collection-datasource/graphql/constants';
import isEmpty from 'lodash/fp/isEmpty';
import { ColumnDefinition } from 'app/components/collection/DataGrid';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { toCurrency } from 'utils/numberFormat';
import Bill from 'app/models/bill';
import { Space, Typography } from 'antd';
const { Text } = Typography;

const getDefaultReportQueryCriteria = (dateRange: any[]): QueryCriteria[] => {
  const criteria: QueryCriteria[] = [
    {
      field: 'IsArchived',
      operator: GRAPHQL_QUERY_OPERATOR.EQUALS,
      value: false,
    },
  ];

  if (!isEmpty(dateRange)) {
    const [fromDate, toDate] = dateRange;
    criteria.push({
      field: 'Date',
      operator: GRAPHQL_QUERY_OPERATOR.GTE,
      value: fromDate.format('YYYY-MM-DD 00:00:00'),
    });
    criteria.push({
      field: 'Date',
      operator: GRAPHQL_QUERY_OPERATOR.LTE,
      value: toDate.format('YYYY-MM-DD 23:59:59'),
    });
  }

  return criteria;
};

const getAdminCols = (): ColumnDefinition[] => {
  const role = authStorage.getRole();
  if (role === Role.ADMIN) {
    return [
      {
        title: 'Lợi nhuận thô sau/trước thuế',
        key: 'profit',
        width: 350,
        render: (bill: Bill) => {
          return (
            <Space>
              <Text>
                {toCurrency(
                  (bill.salePrice || 0) -
                    (bill.purchasePriceAfterVatInVnd || 0),
                )}
              </Text>
              <Text>/</Text>
              <Text>
                {toCurrency(
                  (bill.salePrice || 0) - (bill.purchasePriceInVnd || 0),
                )}
              </Text>
            </Space>
          );
        },
      },
      {
        title: 'Lợi nhuận thực',
        key: 'profit',
        dataIndex: 'profit',
        width: 150,
        render: (value: number) => {
          return (
            <>
              {value && (
                <span style={{ color: value <= 0 ? '#cf1322' : '#3f8600' }}>
                  {toCurrency(value)}
                </span>
              )}
            </>
          );
        },
      },
    ];
  }

  return [];
};

export { getDefaultReportQueryCriteria, getAdminCols };
