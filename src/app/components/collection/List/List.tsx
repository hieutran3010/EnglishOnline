import React, { useState, useEffect, useCallback } from 'react';
import isEmpty from 'lodash/fp/isEmpty';
import getOr from 'lodash/fp/getOr';
import map from 'lodash/fp/map';
import { List, Input, Pagination, Space, Select, Tooltip } from 'antd';
import { ListProps } from 'antd/lib/list';
import { IDataSource, QueryCriteria, QueryOperator } from '../types';
import { Container } from './styles/StyledIndex';

const { Option } = Select;

const getItemValue = (item, field) => {
  if (typeof item === 'string') {
    return item;
  }
  if (isEmpty(field)) {
    return item.toString();
  }
  return getOr('', field)(item);
};

interface Props {
  graphQLDataSource: IDataSource;
  pageSize?: number;
  displayPath?: string;
  onSelectionChanged?: (item: any) => void;
  searchPlaceholder?: string;
  searchHint?: string;
  searchFields?: string[];
}
export default function DefaultList({
  graphQLDataSource,
  pageSize,
  displayPath,
  onSelectionChanged,
  searchPlaceholder,
  searchHint,
  searchFields,
  ...restProps
}: Props & ListProps<any>) {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize || 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<QueryCriteria[]>([]);

  const fetchTotal = useCallback(async (currentFilters?: QueryCriteria[]) => {
    const totalItem = await graphQLDataSource.countAsync(
      currentFilters ?? filters,
    );
    setTotal(totalItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(
    async (
      pageSize?: number,
      page?: number,
      currentFilters?: QueryCriteria[],
    ) => {
      setLoading(true);

      const data = await graphQLDataSource.queryManyAsync(
        {
          pageSize: pageSize ?? currentPageSize,
          page: page ?? currentPage,
          criteria: currentFilters ?? filters,
        },
        true,
      );

      setItems(data);

      setLoading(false);
    },
    [currentPage, currentPageSize, filters, graphQLDataSource],
  );

  useEffect(() => {
    let reloadedSubscription;
    if (graphQLDataSource) {
      reloadedSubscription = graphQLDataSource.onReloaded.subscribe(() => {
        fetchTotal();
        fetchData();
      });
    }
    return function cleanUp() {
      if (reloadedSubscription) {
        reloadedSubscription.unsubscribe();
      }
    };
  }, [fetchData, fetchTotal, graphQLDataSource]);

  useEffect(() => {
    fetchTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onItemClicked = useCallback(
    item => () => {
      if (onSelectionChanged) {
        onSelectionChanged(item);
      }
    },
    [onSelectionChanged],
  );

  const onPageChanged = useCallback(
    (page: number, pageSize?: number | undefined) => {
      setCurrentPage(page);
      fetchData(pageSize, page);
    },
    [fetchData],
  );

  const onPageSizeChanged = useCallback(
    (size: number) => {
      setCurrentPageSize(size);
      fetchData(size, currentPage);
    },
    [currentPage, fetchData],
  );

  const onSearchChanged = useCallback(
    (searchKey: string) => {
      if (isEmpty(searchKey)) {
        setFilters([]);
        fetchTotal([]);
        fetchData(pageSize, currentPage, []);
        return;
      }

      const criteria = map(
        (searchField: string): QueryCriteria => {
          return {
            field: searchField,
            operator: QueryOperator.C,
            value: searchKey,
          };
        },
      )(searchFields);

      setFilters(criteria);
      setCurrentPage(1);

      fetchTotal(criteria);
      fetchData(pageSize, 1, criteria);
    },
    [currentPage, fetchData, fetchTotal, pageSize, searchFields],
  );

  const defaultItemRender = item => (
    <List.Item onClick={onItemClicked(item)}>
      {getItemValue(item, displayPath)}
    </List.Item>
  );

  const { renderItem } = restProps;
  return (
    <Container>
      {!isEmpty(searchFields) && (
        <Tooltip title={searchHint}>
          <Input.Search
            enterButton
            disabled={loading}
            size="small"
            placeholder={searchPlaceholder}
            onSearch={onSearchChanged}
            allowClear
          />
        </Tooltip>
      )}
      <List
        style={{
          flex: '1 1 auto',
          overflow: 'auto',
          height: 0,
          marginTop: 5,
          marginBottom: 5,
        }}
        size="small"
        dataSource={items}
        renderItem={renderItem || defaultItemRender}
        loading={loading}
        {...restProps}
      />
      <Space align="center">
        <Pagination
          size="small"
          total={total}
          simple
          disabled={loading}
          pageSize={currentPageSize}
          current={currentPage}
          onChange={onPageChanged}
        />
        <Select
          size="small"
          onChange={onPageSizeChanged}
          value={currentPageSize}
        >
          <Option value={10}>10/trang</Option>
          <Option value={20}>20/trang</Option>
          <Option value={30}>30/trang</Option>
          <Option value={40}>40/trang</Option>
          <Option value={50}>50/trang</Option>
        </Select>
      </Space>
    </Container>
  );
}
