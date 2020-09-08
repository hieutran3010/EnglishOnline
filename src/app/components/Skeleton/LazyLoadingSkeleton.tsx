import React from 'react';
import { Space, Spin, Typography } from 'antd';
const { Text } = Typography;

const LazyLoadingSkeleton = props => {
  if (props.error) {
    window.location.reload(true);
    return <></>;
  }

  return (
    <Space>
      <Spin />
      <Text>Đang tải...</Text>
    </Space>
  );
};

export default LazyLoadingSkeleton;
