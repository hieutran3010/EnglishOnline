import React, { memo, useMemo } from 'react';
import { Tag, Tooltip } from 'antd';
import { BILL_STATUS } from 'app/models/bill';
interface Props {
  status: BILL_STATUS | string | undefined;
}
const BillStatusTag = ({ status }: Props) => {
  const StatusTag = useMemo(() => {
    switch (status) {
      case BILL_STATUS.LICENSE: {
        return (
          <Tag color={'geekblue'} key={status}>
            Chứng Từ
          </Tag>
        );
      }
      case BILL_STATUS.ACCOUNTANT: {
        return (
          <Tag color={'orange'} key={status}>
            Kế Toán
          </Tag>
        );
      }
      case BILL_STATUS.DONE: {
        return (
          <Tag color={'green'} key={status}>
            Đã Chốt
          </Tag>
        );
      }
      default: {
        return <></>;
      }
    }
  }, [status]);

  return <Tooltip title="Trạng thái Bill">{StatusTag}</Tooltip>;
};

export default memo(BillStatusTag);
