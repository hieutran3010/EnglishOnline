import React, { memo, ReactElement, useCallback } from 'react';
import { List, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import size from 'lodash/fp/size';

export interface IInfiniteLoadingListProps {
  onRenderItem: (item: any) => ReactElement;
  loading?: boolean;
  totalItems?: number;
  data?: any[];
  onLoadData?: () => void;
  initialLoad?: boolean;
}
const InfiniteLoadingList = ({
  onRenderItem,
  loading,
  data,
  totalItems,
  onLoadData,
  initialLoad,
}: IInfiniteLoadingListProps) => {
  const hasMore = size(data) < (totalItems || 0);

  const handleInfiniteOnLoad = useCallback(() => {
    onLoadData && onLoadData();
  }, [onLoadData]);

  return (
    <InfiniteScroll
      initialLoad={initialLoad}
      pageStart={0}
      loadMore={handleInfiniteOnLoad}
      hasMore={hasMore && !loading}
      useWindow={false}
    >
      <List dataSource={data} renderItem={onRenderItem} />
      {loading && (
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin />
        </div>
      )}
    </InfiniteScroll>
  );
};

export default memo(InfiniteLoadingList);
