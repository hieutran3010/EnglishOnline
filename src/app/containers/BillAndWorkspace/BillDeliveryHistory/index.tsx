/**
 *
 * BillDeliveryHistory
 *
 */

import React, { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Timeline, Typography, Space, Button, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import map from 'lodash/fp/map';
import uniqueId from 'lodash/fp/uniqueId';

import { ContentContainer } from 'app/components/Layout';
import Bill, { BillDeliveryHistory } from 'app/models/bill';
import useBillDeliveryHistory from './hook';
import { actions } from './slice';
import { selectIsFetchingHistories, selectHistories } from './selectors';
import { GroupedHistory } from './types';
import DeliveryHistoryModal from './DeliveryHistoryModal';

const { Text } = Typography;

interface Props {
  selfControl?: boolean;
  size?: 'small' | 'default' | undefined;
  bill: Bill;
}
export const BillDeliveryHistoryPage = memo(
  ({ selfControl, size, bill }: Props) => {
    const dispatch = useDispatch();
    if (selfControl === true) {
      useBillDeliveryHistory();
    }

    const [visibleCreateOrEditModal, setVisibleCreateOrEditModal] = useState(
      false,
    );

    useEffect(() => {
      dispatch(actions.fetchBillDeliveryHistories(bill.id));
    }, [bill, dispatch]);

    const isFetching = useSelector(selectIsFetchingHistories);
    const histories = useSelector(selectHistories);

    const onAddNew = useCallback(() => {
      setVisibleCreateOrEditModal(true);
    }, []);

    const onCloseModal = useCallback(() => {
      setVisibleCreateOrEditModal(false);
    }, []);

    const onDeliverySubmitted = useCallback((history: BillDeliveryHistory) => {
      console.log(history);
    }, []);

    return (
      <ContentContainer
        title={
          <Space>
            <Text>Tình trạng hàng của bill</Text>
            <Text strong>
              {bill.airlineBillId ||
                bill.childBillId ||
                'Chưa có bill hãng bay/bill con'}
            </Text>
            <Tooltip title="Thêm tình trạng mới">
              <Button
                type="primary"
                shape="circle"
                size="small"
                onClick={onAddNew}
                icon={<PlusOutlined />}
              />
            </Tooltip>
          </Space>
        }
        size={size}
        loading={isFetching}
        actions={[
          <Button type="ghost" icon={<SaveOutlined />} style={{ border: 0 }}>
            Lưu thay đổi
          </Button>,
          <Button type="ghost" icon={<ClearOutlined />} style={{ border: 0 }}>
            Hủy thay đổi
          </Button>,
        ]}
      >
        {map((groupedHistory: GroupedHistory) => {
          return (
            <div key={uniqueId('gh_')}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginBottom: 20,
                }}
              >
                <Space>
                  <Text strong>{groupedHistory.date || '<Không có ngày>'}</Text>
                  <Tooltip title="Thêm tình trạng hàng vào ngày này">
                    <Button
                      size="small"
                      shape="circle"
                      type="primary"
                      ghost
                      icon={<PlusOutlined />}
                    />
                  </Tooltip>
                </Space>
              </div>

              <Timeline>
                {map((history: BillDeliveryHistory) => {
                  const { time, status } = history;
                  return (
                    <Timeline.Item key={uniqueId('gh_tl_')}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {time && (
                          <Text strong style={{ marginRight: 5 }}>
                            {moment(time).format('HH:mm')}:
                          </Text>
                        )}
                        <Text style={{ marginRight: 5 }}>{status}</Text>
                        <EditOutlined
                          style={{ cursor: 'pointer', marginRight: 5 }}
                        />
                        <DeleteOutlined
                          style={{ cursor: 'pointer', color: 'red' }}
                        />
                      </div>
                    </Timeline.Item>
                  );
                })(groupedHistory.histories)}
              </Timeline>
            </div>
          );
        })(histories)}
        <DeliveryHistoryModal
          visible={visibleCreateOrEditModal}
          onClose={onCloseModal}
          airLineBillId={bill.airlineBillId}
          childBillId={bill.childBillId}
          onSubmitted={onDeliverySubmitted}
        />
      </ContentContainer>
    );
  },
);
