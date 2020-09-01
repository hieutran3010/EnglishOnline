import React, { memo } from 'react';
import isEmpty from 'lodash/fp/isEmpty';
import orderBy from 'lodash/fp/orderBy';
import head from 'lodash/fp/head';
import { Typography } from 'antd';

import { BillDeliveryHistory } from 'app/models/bill';

const { Text } = Typography;

interface Props {
  histories: BillDeliveryHistory[];
}
const LastBillDeliveryHistory = ({ histories }: Props) => {
  if (isEmpty(histories)) {
    return <></>;
  }

  const lastHistory = head(
    orderBy(['date', 'time'], 'desc')(histories),
  ) as BillDeliveryHistory;

  return <Text>{lastHistory?.status || ''}</Text>;
};

export default memo(LastBillDeliveryHistory);
