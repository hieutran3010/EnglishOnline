/* eslint-disable indent */
import React, { useState, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import { Key, TablePaginationConfig } from 'antd/lib/table/interface';
import keys from 'lodash/fp/keys';
import find from 'lodash/fp/find';
import get from 'lodash/fp/get';
import isEmpty from 'lodash/fp/isEmpty';
import isArray from 'lodash/fp/isArray';
import head from 'lodash/fp/head';

import { ColumnDefinition, TableChangedEventArgs } from './types';
import { OrderOption, QueryCriteria, QueryOperator } from '../types';
import { formatColumns } from './utils';
import { TableProps } from 'antd/lib/table';

interface ISimpleDataGrid {
  columns: ColumnDefinition[];
  pageSizeOptions: Array<string>;
  pageSize: number;
  maxHeight?: number;
  width?: number | string;
  heightOffset?: number;
  totalCount?: number;
  onTableChanged?: (e: TableChangedEventArgs) => void;
}
export default function SimpleDataGrid({
  columns,
  pageSizeOptions,
  pageSize,
  maxHeight,
  width,
  heightOffset,
  totalCount,
  onTableChanged,
  ...restProps
}: ISimpleDataGrid & TableProps<any>) {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    pageSize,
    current: 1,
  });

  /**
   * From the filter model of Ant Table, let's create the criteria that are able to query via IDataSource
   */
  const getQueryCriteria = useCallback(
    (antTableFilters: Record<string, Key[] | null>): QueryCriteria[] => {
      const result: QueryCriteria[] = [];
      const filterKeys = keys(antTableFilters);

      if (!isEmpty(filterKeys)) {
        filterKeys.forEach((filterKey: string) => {
          let filterValue = get(filterKey)(antTableFilters);

          if (isArray(filterValue) && !isEmpty(filterValue)) {
            filterValue = head(filterValue);
          }

          if (!isEmpty(filterValue)) {
            const colConfig = find(
              (col: ColumnDefinition) => col.key === filterKey,
            )(columns);

            if (colConfig) {
              result.push({
                field: colConfig.dataIndex || colConfig.filterField || '',
                value: filterValue,
                operator: colConfig.searchOperator || QueryOperator.C,
              });
            }
          }
        });
      }
      return result;
    },
    [columns],
  );

  const onTableChange = useCallback(
    (
      currentPagination: TablePaginationConfig,
      filters: Record<string, Key[] | null>,
      sorter: any,
    ) => {
      setPagination({
        current: currentPagination.current,
        pageSize: currentPagination.pageSize,
      });

      let currentOrder: OrderOption | undefined = undefined;
      if (sorter) {
        const { field, order } = sorter;
        currentOrder = {
          orderByField: field,
          isDescending: order === 'descend',
        };
      }

      if (onTableChanged) {
        const queryCriteria = getQueryCriteria(filters);
        onTableChanged({
          queryCriteria,
          order: currentOrder,
          pageSize: currentPagination.pageSize,
          page: currentPagination.current,
        });
      }
    },
    [getQueryCriteria, onTableChanged],
  );

  const formattedColumns = useMemo(() => formatColumns(columns), [columns]);
  const _maxHeight = useMemo(() => {
    if (maxHeight) {
      return maxHeight;
    }

    if (heightOffset) {
      const offset = window.innerHeight * heightOffset;
      return window.innerHeight - offset;
    }

    return 400;
  }, [heightOffset, maxHeight]);

  return (
    <Table
      scroll={{ x: width ?? 'max-content', y: _maxHeight }}
      columns={formattedColumns}
      rowKey={(record: any) => record.id}
      onChange={onTableChange}
      pagination={{
        pageSizeOptions,
        showSizeChanger: true,
        defaultPageSize: 20,
        pageSize: pagination.pageSize,
        current: pagination.current,
        total: totalCount,
      }}
      {...restProps}
    />
  );
}

SimpleDataGrid.defaultProps = {
  pageSizeOptions: ['10', '20', '30', '40', '50', '80', '100'],
  pageSize: 20,
  size: 'small',
};
