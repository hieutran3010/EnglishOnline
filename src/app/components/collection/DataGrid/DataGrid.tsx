/* eslint-disable indent */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import {
  Key,
  TablePaginationConfig,
  TableLocale,
} from 'antd/lib/table/interface';
import keys from 'lodash/fp/keys';
import find from 'lodash/fp/find';
import get from 'lodash/fp/get';
import isEmpty from 'lodash/fp/isEmpty';
import isArray from 'lodash/fp/isArray';
import head from 'lodash/fp/head';
import { ColumnDefinition } from './types';
import {
  IDataSource,
  OrderOption,
  QueryCriteria,
  QueryOperator,
  QueryParams,
} from '../types';
import { formatColumns } from './utils';

interface DataGrid {
  dataSource: IDataSource;
  columns: ColumnDefinition[];
  pageSizeOptions: Array<string>;
  pageSize: number;
  maxHeight: number;
  locale?: TableLocale;
  size: 'large' | 'middle' | 'small';
}
export default function DataGrid({
  dataSource,
  columns,
  pageSizeOptions,
  pageSize,
  maxHeight,
  locale,
  size,
  ...restProps
}: DataGrid) {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    pageSize,
    current: 1,
  });
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [antTableFilter, setAntTableFilter] = useState<
    Record<string, Key[] | null>
  >({});
  const [order, setOrder] = useState<OrderOption>({});

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
                field: colConfig.dataIndex || '',
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

  /**
   * Fetch total count by QueryCriteria
   */
  const fetchTotalCount = useCallback(async () => {
    const queryCriteria = getQueryCriteria(antTableFilter);

    const totalItem = await dataSource.countAsync(queryCriteria);
    setTotal(totalItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [antTableFilter]);

  /**
   * Fetch data by query criteria
   */
  const fetchData = useCallback(async () => {
    setLoading(true);

    const queryParams: QueryParams = {
      pageSize: pagination.pageSize,
      page: pagination.current,
      criteria: getQueryCriteria(antTableFilter),
      ...order,
    };

    const data = await dataSource.queryManyAsync(queryParams);

    setLoading(false);

    setItems(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, antTableFilter, order]);

  /**
   * Auto register reloading data when placeholder requesting and dispose it when component is unmounted
   */
  useEffect(() => {
    let reloadedSubscription;
    if (dataSource) {
      reloadedSubscription = dataSource.onReloaded.subscribe(() => {
        setAntTableFilter({});
        setOrder({});

        const pager = { ...pagination };
        pager.current = 1;
        setPagination(pager);

        fetchTotalCount();
        fetchData();
      });
    }

    return function cleanUp() {
      if (reloadedSubscription) {
        reloadedSubscription.unsubscribe();
      }
    };
  }, [dataSource, fetchData, fetchTotalCount, pagination]);

  /**
   * Fetching total count at initializing
   */
  useEffect(() => {
    fetchTotalCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetching data at initializing
   */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTableChange = useCallback(
    (
      currentPagination: TablePaginationConfig,
      filters: Record<string, Key[] | null>,
      sorter: any,
    ) => {
      const pager = { ...pagination };
      if (currentPagination !== pager) {
        pager.current = currentPagination.current;
        pager.pageSize = currentPagination.pageSize;
        setPagination(pager);
      }

      if (antTableFilter !== filters) {
        setAntTableFilter(filters);
      }

      if (sorter) {
        const { field, order } = sorter;
        setOrder({
          orderByField: field,
          isDescending: order === 'descend',
        });
      }

      fetchTotalCount();
      fetchData();
    },
    [antTableFilter, fetchData, fetchTotalCount, pagination],
  );

  const onFormatColumns = useMemo(() => formatColumns(columns), [columns]);

  return (
    <Table
      {...restProps}
      scroll={{ y: maxHeight }}
      columns={onFormatColumns}
      dataSource={items}
      rowKey={(record: any) => record.id}
      loading={loading}
      onChange={onTableChange}
      pagination={{
        pageSizeOptions,
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSize: pagination.pageSize,
        current: pagination.current,
        total,
      }}
      size={size}
      locale={locale}
    />
  );
}

DataGrid.defaultProps = {
  pageSizeOptions: ['10', '20', '30', '40'],
  pageSize: 10,
  maxHeight: 600,
  size: 'middle',
};
