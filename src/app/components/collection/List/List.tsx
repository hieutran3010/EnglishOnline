import React, { useState, useEffect, useCallback } from 'react';
import isEmpty from 'lodash/fp/isEmpty';
import getOr from 'lodash/fp/getOr';
import { List, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { WrappedListStyle } from './styles/StyledIndex';
import { IDataSource } from '../types';
import { ListProps } from 'antd/lib/list';

const getItemValue = (item, field) => {
  if (typeof item === 'string') {
    return item;
  }
  if (isEmpty(field)) {
    return item.toString();
  }
  return getOr('', field)(item);
};

interface ListPagination {
  pageSize: number;
  page: number;
}
interface Props {
  graphQLDataSource: IDataSource;
  pageSize?: number;
  displayPath?: string;
  onSelectionChanged?: (item: any) => void;
  onStartFetchingData?: () => void;
  onFinishFetchingData?: () => void;
  manualShowLoading?: boolean;
}
export default function DefaultList({
  graphQLDataSource,
  pageSize,
  displayPath,
  onSelectionChanged,
  onStartFetchingData,
  onFinishFetchingData,
  manualShowLoading,
  ...restProps
}: Props & ListProps<any>) {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<ListPagination>({
    pageSize: pageSize || 10,
    page: 1,
  });

  const fetchTotal = useCallback(async () => {
    const totalItem = await graphQLDataSource.countAsync([]);
    setTotal(totalItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(async () => {
    if (manualShowLoading === true) {
      setLoading(true);
    }

    if (onStartFetchingData) {
      onStartFetchingData();
    }

    const data = await graphQLDataSource.queryManyAsync({
      pageSize: pagination.pageSize,
      page: pagination.page,
    });

    if (!isEmpty(data)) {
      const newData = items.concat(data);
      setItems(newData);
    } else {
      setItems([]);
    }

    if (onFinishFetchingData) {
      onFinishFetchingData();
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, pagination]);

  const onResetData = useCallback(() => {
    setPagination({ ...pagination, page: 1 });
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  useEffect(() => {
    let reloadedSubscription;
    if (graphQLDataSource) {
      reloadedSubscription = graphQLDataSource.onReloaded.subscribe(
        onResetData,
      );
    }
    return function cleanUp() {
      if (reloadedSubscription) reloadedSubscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (onSelectionChanged) onSelectionChanged(item);
    },
    [onSelectionChanged],
  );

  const defaultItemRender = item => (
    <List.Item onClick={onItemClicked(item)}>
      {getItemValue(item, displayPath)}
    </List.Item>
  );

  const handleInfiniteOnLoad = useCallback(() => {
    if (items.length === total) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    setPagination({ ...pagination, page: pagination.page + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, total]);

  const { renderItem } = restProps;
  return (
    <InfiniteScroll
      initialLoad={false}
      pageStart={0}
      loadMore={handleInfiniteOnLoad}
      hasMore={!loading && hasMore}
      useWindow={false}
    >
      <WrappedListStyle>
        <List
          dataSource={items}
          renderItem={renderItem || defaultItemRender}
          loadMore={loading && !manualShowLoading && <Spin size="small" />}
          {...restProps}
        >
          {/* {loading && hasMore && (
            <LoadingContainer>
              <Spin />
            </LoadingContainer>
          )} */}
        </List>
      </WrappedListStyle>
    </InfiniteScroll>
  );
}
