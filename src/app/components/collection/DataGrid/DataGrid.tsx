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
import isEqual from 'lodash/fp/isEqual';
import all from 'lodash/fp/all';
import values from 'lodash/fp/values';

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
  maxHeight?: number;
  width?: number | boolean | string | 'max-content';
  heightOffset?: number;
  locale?: TableLocale;
  dontLoadInitialData?: boolean;
  onTotalCountChanged?: (count: number) => void;
  onLoadingTotalCount?: (isLoading: boolean) => void;
  onLoading?: (isLoading: boolean) => void;
}
export default function DataGrid({
  dataSource,
  columns,
  pageSizeOptions,
  pageSize,
  maxHeight,
  width,
  heightOffset,
  locale,
  dontLoadInitialData,
  onTotalCountChanged,
  onLoadingTotalCount,
  onLoading,
  ...restProps
}: DataGrid & any) {
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

  /**
   * Fetch total count by QueryCriteria
   */
  const fetchTotalCount = useCallback(
    async (tableFilter?: Record<string, React.Key[] | null>) => {
      onLoadingTotalCount && onLoadingTotalCount(true);

      const _filter = tableFilter || antTableFilter;
      // if (isEmpty(_filter) || all(v => isNil(v))(values(_filter))) {
      //   if (dontLoadInitialData === true) {
      //     setItems([]);
      //     return;
      //   }
      // }

      const queryCriteria = getQueryCriteria(_filter);

      const totalItem = await dataSource.countAsync(queryCriteria);
      setTotal(totalItem);
      onTotalCountChanged && onTotalCountChanged(totalItem);
      onLoadingTotalCount && onLoadingTotalCount(false);
    },
    [
      antTableFilter,
      dataSource,
      getQueryCriteria,
      onTotalCountChanged,
      onLoadingTotalCount,
    ],
  );

  /**
   * Fetch data by query criteria
   */
  const fetchData = useCallback(
    async (
      tableFilter?: Record<string, React.Key[] | null>,
      inputOrder?: OrderOption,
      inputPagination?: TablePaginationConfig,
    ) => {
      const _filter = tableFilter || antTableFilter;
      // if (isEmpty(_filter) || all(v => isNil(v))(values(_filter))) {
      //   if (dontLoadInitialData === true) {
      //     setItems([]);
      //     return;
      //   }
      // }

      setLoading(true);

      const paging = inputPagination || pagination;

      const queryParams: QueryParams = {
        pageSize: paging.pageSize,
        page: paging.current,
        criteria: getQueryCriteria(_filter),
        order: inputOrder || order,
      };

      const data = await dataSource.queryManyAsync(queryParams);

      setLoading(false);

      setItems(data);
    },
    [antTableFilter, pagination, getQueryCriteria, order, dataSource],
  );

  /**
   * Auto register reloading data when placeholder requesting and dispose it when component is unmounted
   */
  useEffect(() => {
    let reloadedSubscription;
    if (dataSource) {
      reloadedSubscription = dataSource.onReloaded.subscribe(() => {
        // setAntTableFilter({});
        // setOrder({});

        // const pager = { ...pagination };
        // pager.current = 1;
        // setPagination(pager);

        // fetchTotalCount({});
        // fetchData({}, {}, pager);

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
    if (!dontLoadInitialData) {
      fetchTotalCount();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dontLoadInitialData]);

  /**
   * Fetching data at initializing
   */
  useEffect(() => {
    if (!dontLoadInitialData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dontLoadInitialData]);

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

      setAntTableFilter(filters);

      let currentOrder: OrderOption | undefined = undefined;
      if (sorter) {
        const { field, order } = sorter;
        currentOrder = {
          orderByField: field,
          isDescending: order === 'descend',
        };
        setOrder(currentOrder);
      }

      if (
        !isEqual(filters, antTableFilter) &&
        !(isEmpty(antTableFilter) && all(v => v === null)(values(filters)))
      ) {
        fetchTotalCount(filters);
      }

      fetchData(filters, currentOrder, currentPagination);
    },
    [antTableFilter, fetchData, fetchTotalCount],
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
      dataSource={items}
      rowKey={(record: any) => record.id}
      loading={loading}
      onChange={onTableChange}
      pagination={{
        pageSizeOptions,
        showSizeChanger: true,
        defaultPageSize: 20,
        pageSize: pagination.pageSize,
        current: pagination.current,
        total,
      }}
      locale={locale}
      {...restProps}
    />
  );
}

DataGrid.defaultProps = {
  pageSizeOptions: ['10', '20', '30', '40', '50', '80', '100'],
  pageSize: 20,
  size: 'small',
};
