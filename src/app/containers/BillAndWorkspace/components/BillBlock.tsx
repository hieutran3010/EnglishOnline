import React, { memo, useCallback } from 'react';
import type Bill from 'app/models/bill';
import { Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import BillStatusTag from './BillStatusTag';

interface Props {
  bill: Bill;
  onEdit: (bill: Bill) => void;
}
const BillBlock = ({ bill, onEdit }: Props) => {
  const _onEdit = useCallback(() => {
    onEdit(bill);
  }, [bill, onEdit]);

  return (
    <Card
      size="small"
      actions={[
        <BillStatusTag status={bill.status} />,
        <EyeOutlined key="edit" onClick={_onEdit} />,
      ]}
      style={{
        marginBottom: 10,
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      <span style={{ fontWeight: 600 }}>{bill.airlineBillId}</span>
    </Card>
  );
};

export default memo(BillBlock);
