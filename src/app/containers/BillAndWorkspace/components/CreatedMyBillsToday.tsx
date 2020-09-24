import React, { memo, useEffect } from 'react';
import { Typography, Space, Tag } from 'antd';

const { Text } = Typography;

interface Props {
  numberOfBills: number;
  onCountTotalMyBillsCreatedToday?: () => void;
}
const CreatedMyBillsToday = ({
  numberOfBills,
  onCountTotalMyBillsCreatedToday,
}: Props) => {
  useEffect(() => {
    let counter;
    if (onCountTotalMyBillsCreatedToday) {
      counter = setInterval(() => {
        onCountTotalMyBillsCreatedToday();
      }, 5000);
    }

    return function cleanUp() {
      if (counter) {
        clearInterval(counter);
      }
    };
  }, [onCountTotalMyBillsCreatedToday]);

  return (
    <Space size="small">
      <Tag color="geekblue" style={{ margin: 0 }}>
        {numberOfBills}
      </Tag>
      <Text>bills bạn tạo hôm nay</Text>
    </Space>
  );
};

export default memo(CreatedMyBillsToday);
