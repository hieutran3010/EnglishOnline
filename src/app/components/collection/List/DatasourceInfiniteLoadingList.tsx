import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import * as Sentry from '@sentry/react';
import InfiniteLoadingList, {
  IInfiniteLoadingListProps,
} from './InfiniteLoadingList';
import {
  IDataSource,
  OrderOption,
  QueryCriteria,
  QueryOperator,
} from '../types';
import { concat, trim, join } from 'lodash/fp';
import isEmpty from 'lodash/fp/isEmpty';

import { Input, Space, Tag, Tooltip, Typography } from 'antd';

const { Search } = Input;
const { Text } = Typography;

interface Props extends IInfiniteLoadingListProps {
  datasource: IDataSource;
  pageSize?: number;
  orders?: OrderOption;
  canSearch?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
}
const DatasourceInfiniteLoadingList = ({
  datasource,
  onRenderItem,
  pageSize,
  orders,
  canSearch,
  searchPlaceholder,
  searchFields,
}: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<QueryCriteria[]>([]);
  const [currentSearchKey, setCurrentSearchKey] = useState<
    string | undefined
  >();

  const totalPage = useMemo(() => {
    return Math.ceil(totalCount / (pageSize ?? 20));
  }, [pageSize, totalCount]);

  const _getTotal = useCallback(
    async (queryCriteria: QueryCriteria[] = []) => {
      const total = await datasource.countAsync(queryCriteria).catch(error => {
        Sentry.captureException(
          `[DatasourceInfiniteLoadingList][_getTotal]. Error: ${JSON.stringify(
            error,
          )}`,
        );

        return 0;
      });

      return total;
    },
    [datasource],
  );

  const _getItems = useCallback(
    async (newPage: number, queryCriteria: QueryCriteria[] = []) => {
      const items = await datasource
        .queryManyAsync(
          {
            criteria: queryCriteria,
            page: newPage,
            pageSize: pageSize ?? 20,
            order: orders,
          },
          true,
        )
        .catch(error => {
          Sentry.captureException(
            `[DatasourceInfiniteLoadingList][_getItems] page = ${newPage}. Error: ${JSON.stringify(
              error,
            )}`,
          );

          return [];
        });

      return items;
    },
    [datasource, orders, pageSize],
  );

  const _onLoadData = useCallback(async () => {
    if (page === totalPage) {
      return;
    }

    setLoading(true);

    const newPage = page + 1;
    const items = await _getItems(newPage, filters);

    setData(page === 0 ? items : concat(data, items));
    setPage(newPage);

    setLoading(false);
  }, [_getItems, data, filters, page, totalPage]);

  useEffect(() => {
    let didCancel = false;
    async function getInitialDataAsync() {
      const firstPage = 0;
      const total = await _getTotal();

      if (!didCancel) {
        setTotalCount(total);
        setData([]);
        setPage(firstPage);
      }
    }

    const reloadedSubscription = datasource.onReloaded.subscribe(() => {
      getInitialDataAsync();
    });

    return function cleanUp() {
      didCancel = true;
      if (reloadedSubscription) {
        reloadedSubscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasource]);

  const onSearchChanged = useCallback(
    async (searchKey: string | undefined) => {
      const formattedSearchKey = trim(searchKey || '');
      if (isEmpty(formattedSearchKey) && isEmpty(currentSearchKey)) {
        return;
      }

      if (formattedSearchKey === currentSearchKey) {
        return;
      }

      let criteria: QueryCriteria[] = [];
      if (!isEmpty(formattedSearchKey)) {
        criteria.push({
          field: join('@')(searchFields),
          operator: QueryOperator.C,
          value: formattedSearchKey,
        });
      }

      setPage(0);
      setFilters(criteria);
      setCurrentSearchKey(formattedSearchKey);

      const newTotal = await _getTotal(criteria);
      setTotalCount(newTotal);

      setData([]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSearchKey, searchFields],
  );

  return (
    <>
      {canSearch && (
        <Tooltip title={searchPlaceholder}>
          <Search
            enterButton
            onSearch={onSearchChanged}
            loading={loading}
            allowClear
            style={{ marginBottom: 10 }}
          />
        </Tooltip>
      )}
      <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Tag color="green" style={{ margin: 0 }}>
          {totalCount}
        </Tag>
        <Text>bills</Text>
      </Space>
      <InfiniteLoadingList
        onRenderItem={onRenderItem}
        data={data}
        onLoadData={_onLoadData}
        loading={loading}
        totalItems={totalCount}
      />
    </>
  );
};

export default memo(DatasourceInfiniteLoadingList);
