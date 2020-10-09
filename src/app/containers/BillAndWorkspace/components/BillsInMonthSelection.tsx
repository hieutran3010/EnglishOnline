import { Select, Space, Typography } from 'antd';
import React, { memo, useMemo } from 'react';
import moment from 'moment';
import map from 'lodash/fp/map';

const { Option } = Select;
const { Text } = Typography;

interface Props {
  onMonthChanged?: (value: number) => void;
  selectedMonth?: number;
}
const BillsInMonthSelection = ({ onMonthChanged, selectedMonth }: Props) => {
  const months = useMemo(() => {
    const results: number[] = [];

    const now = moment();
    results.push(now.month() + 1);

    for (let index = 0; index < 2; index++) {
      const time = moment().subtract(index + 1, 'months');
      results.push(time.month() + 1);
    }

    return map((m: number) => (
      <Option key={m} value={m}>
        {m}
      </Option>
    ))(results);
  }, []);

  return (
    <Space size="small">
      <Select size="small" value={selectedMonth} onChange={onMonthChanged}>
        {months}
      </Select>
      <Text>/</Text>
      <Text>{moment().year()}</Text>
    </Space>
  );
};

export default memo(BillsInMonthSelection);
