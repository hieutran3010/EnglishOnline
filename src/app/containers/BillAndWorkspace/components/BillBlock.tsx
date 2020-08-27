import React, { memo, useCallback, useState } from 'react';
import moment from 'moment';
import type Bill from 'app/models/bill';
import { Card, Typography, Tooltip, Space, Tag } from 'antd';
import {
  EyeOutlined,
  EyeTwoTone,
  DoubleRightOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import BillStatusTag from './BillStatusTag';
import { Role } from 'app/models/user';

const { Text } = Typography;

export enum BILL_BLOCK_ACTION_TYPE {
  EDIT_OR_VIEW = 1,
  HISTORY,
}

interface Props {
  bill: Bill;
  onSelect: (bill: Bill) => void;
  onSelectForDeliveryHistory?: (bill: Bill) => void;
  selectedBillId?: string;
  userRole: Role;
}
const BillBlock = ({
  bill,
  onSelect,
  onSelectForDeliveryHistory,
  selectedBillId,
  userRole,
}: Props) => {
  const [actionType, setActionType] = useState<
    BILL_BLOCK_ACTION_TYPE | undefined
  >();

  const _onSelected = useCallback(() => {
    onSelect(bill);
    setActionType(BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW);
  }, [bill, onSelect]);

  const _onGoToHistory = useCallback(() => {
    if (onSelectForDeliveryHistory) {
      onSelectForDeliveryHistory(bill);
    }

    setActionType(BILL_BLOCK_ACTION_TYPE.HISTORY);
  }, [bill, onSelectForDeliveryHistory]);

  return (
    <Card
      size="small"
      actions={[
        <BillStatusTag status={bill.status} />,
        <>
          {bill.id === selectedBillId &&
          actionType === BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW ? (
            <EyeTwoTone twoToneColor="#52c41a" />
          ) : (
            <EyeOutlined key="edit" onClick={_onSelected} />
          )}
        </>,
        <Tooltip title="Xem/Cập nhật tình trạng hàng">
          {bill.id === selectedBillId &&
          actionType === BILL_BLOCK_ACTION_TYPE.HISTORY ? (
            <HistoryOutlined style={{ color: '#52c41a' }} />
          ) : (
            <HistoryOutlined key="history" onClick={_onGoToHistory} />
          )}
        </Tooltip>,
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
        <Tooltip title="Tên khách gởi >> Tên người nhận">
          <Space>
            <Text>{bill.senderName || '<Không có>'}</Text>
            <DoubleRightOutlined
              style={{ marginBottom: 5, color: '#00a651' }}
            />
            <Text>{bill.receiverName || '<Không có>'}</Text>
          </Space>
        </Tooltip>
      </div>
    </Card>
  );
};

export default memo(BillBlock);
