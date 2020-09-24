import React, { memo, ReactNode, useCallback, useMemo, useState } from 'react';
import moment from 'moment';
import type Bill from 'app/models/bill';
import { Typography, Space, Alert, Divider } from 'antd';
import {
  EyeOutlined,
  EyeTwoTone,
  DoubleRightOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import BillStatusTag from './BillStatusTag';
import { isEmpty } from 'lodash';
import LastBillDeliveryHistory from './LastBillDeliveryHistory';
import {
  StyledBillBlock,
  StyledLeftBillBlock,
  StyledRightBillBlock,
} from './styles/StyledBillBlock';
import BillTrackingId from './BillTrackingId';
import { getContrast } from 'utils/colorUtils';

const { Text } = Typography;

export enum BILL_BLOCK_ACTION_TYPE {
  EDIT_OR_VIEW = 1,
  HISTORY,
}

interface Props {
  bill: Bill | any;
  onView?: (bill: Bill) => void;
  onViewOrEditDeliveryHistory?: (bill: Bill) => void;
  selectedBillId?: string;
  dateBackgroundColor?: string;
  isBusy?: boolean;
  bordered?: boolean;
  extra?: ReactNode[];
}
const BillBlock = ({
  bill,
  onView,
  onViewOrEditDeliveryHistory,
  selectedBillId,
  dateBackgroundColor,
  isBusy,
  bordered,
  extra,
}: Props) => {
  const [actionType, setActionType] = useState<
    BILL_BLOCK_ACTION_TYPE | undefined
  >();

  const _onView = useCallback(() => {
    onView && onView(bill);
    setActionType(BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW);
  }, [bill, onView]);

  const _onGoToHistory = useCallback(() => {
    if (onViewOrEditDeliveryHistory) {
      onViewOrEditDeliveryHistory(bill);
    }

    setActionType(BILL_BLOCK_ACTION_TYPE.HISTORY);
  }, [bill, onViewOrEditDeliveryHistory]);

  const momentBillDate = moment(bill.date);

  const leftProps = useMemo(() => {
    return {
      backgroundColor: dateBackgroundColor,
      color: getContrast(dateBackgroundColor),
    };
  }, [dateBackgroundColor]);

  const containerProps = { bordered };

  return (
    <StyledBillBlock {...containerProps}>
      <StyledLeftBillBlock {...leftProps}>
        <Text>{momentBillDate.date()}</Text>
        <Divider style={{ margin: 0 }} />
        <Text>{momentBillDate.month() + 1}</Text>
      </StyledLeftBillBlock>
      <StyledRightBillBlock>
        <BillTrackingId
          airlineBillId={bill.airlineBillId}
          childBillId={bill.childBillId}
        />

        <Space size="small" style={{ fontSize: '0.8rem' }}>
          <Text>{bill.senderName || '<Không có>'}</Text>
          <DoubleRightOutlined style={{ marginBottom: 5, color: '#00a651' }} />
          <Text>{bill.receiverName || '<Không có>'}</Text>
        </Space>
        {!isEmpty(bill.billDeliveryHistories) && (
          <Alert
            type="success"
            style={{ padding: '1px 7px', fontSize: '0.8rem', width: '100%' }}
            message={
              <LastBillDeliveryHistory histories={bill.billDeliveryHistories} />
            }
          />
        )}
        <Space
          style={{
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <BillStatusTag status={bill.status} />

          {onView && (
            <div style={{ fontSize: '1.2rem' }}>
              {bill.id === selectedBillId &&
              actionType === BILL_BLOCK_ACTION_TYPE.EDIT_OR_VIEW ? (
                <EyeTwoTone
                  key="view"
                  twoToneColor="#52c41a"
                  disabled={isBusy}
                />
              ) : (
                <EyeOutlined key="view" disabled={isBusy} onClick={_onView} />
              )}
            </div>
          )}

          {onViewOrEditDeliveryHistory && (
            <div style={{ fontSize: '1rem', marginRight: '1rem' }}>
              {bill.id === selectedBillId &&
              actionType === BILL_BLOCK_ACTION_TYPE.HISTORY ? (
                <HistoryOutlined
                  key="history"
                  style={{ color: '#52c41a' }}
                  disabled={isBusy}
                />
              ) : (
                <HistoryOutlined
                  key="history"
                  onClick={_onGoToHistory}
                  disabled={isBusy}
                />
              )}
            </div>
          )}
          {extra}
        </Space>
      </StyledRightBillBlock>
    </StyledBillBlock>
  );
};

export default memo(BillBlock);
