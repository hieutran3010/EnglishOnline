import React, { memo, useCallback } from 'react';
import moment from 'moment';
import type Bill from 'app/models/bill';
import { Card, Typography, Tooltip, Space, Tag } from 'antd';
import { EyeOutlined, EyeTwoTone } from '@ant-design/icons';
import BillStatusTag from './BillStatusTag';

const { Text } = Typography;

interface Props {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  selectedBillId?: string;
}
const BillBlock = ({ bill, onEdit, selectedBillId }: Props) => {
  const _onEdit = useCallback(() => {
    onEdit(bill);
  }, [bill, onEdit]);

  return (
    <Card
      size="small"
      actions={[
        <BillStatusTag status={bill.status} />,
        <>
          {bill.id === selectedBillId ? (
            <EyeTwoTone twoToneColor="#52c41a" />
          ) : (
            <EyeOutlined key="edit" onClick={_onEdit} />
          )}
        </>,
      ]}
      style={{
        marginBottom: 10,
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <Tooltip title="Bill hãng bay">
          <Space>
            <Text strong>
              {bill.airlineBillId || '<Chưa có Bill hãng bay>'}
            </Text>
            <Tag color="cyan">{moment(bill.date).format('DD/MM')}</Tag>
          </Space>
        </Tooltip>
        <Tooltip title="Bill con">
          <Text>{bill.childBillId || '<Chưa có Bill con>'}</Text>
        </Tooltip>
        <Tooltip title="Khách gởi">
          <Text>
            {bill.senderName} - {bill.senderPhone}
          </Text>
        </Tooltip>
      </div>
    </Card>
  );
};

export default memo(BillBlock);
