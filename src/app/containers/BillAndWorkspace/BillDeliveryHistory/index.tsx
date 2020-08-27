/**
 *
 * BillDeliveryHistory
 *
 */

import React, { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Timeline,
  Typography,
  Space,
  Button,
  Tooltip,
  Empty,
  Alert,
} from 'antd';
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
import isEmpty from 'lodash/fp/isEmpty';

import { ContentContainer } from 'app/components/Layout';
import Bill, { BillDeliveryHistory } from 'app/models/bill';
import useBillDeliveryHistory from './hook';
import { actions } from './slice';
import {
  selectIsFetchingHistories,
  selectHistories,
  selectIsDirty,
  selectIsSaving,
} from './selectors';
import { GroupedHistory } from './types';
import DeliveryHistoryModal from './DeliveryHistoryModal';
import { showConfirm } from 'app/components/Modal/utils';

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

    const [selectedHistory, setSelectedHistory] = useState<
      BillDeliveryHistory | undefined
    >();

    useEffect(() => {
      dispatch(actions.fetchBillDeliveryHistories(bill.id));
    }, [bill, dispatch]);

    const isFetching = useSelector(selectIsFetchingHistories);
    const histories = useSelector(selectHistories);
    const isDirty = useSelector(selectIsDirty);
    const isSaving = useSelector(selectIsSaving);

    const onVisibleModal = useCallback(() => {
      setVisibleCreateOrEditModal(true);
    }, []);

    const onAddNewAtADate = useCallback(
      (groupedHistoryItem: GroupedHistory) => () => {
        setSelectedHistory({ date: groupedHistoryItem.rawDate });
        onVisibleModal();
      },
      [onVisibleModal],
    );

    const onEdit = useCallback(
      (history: BillDeliveryHistory) => () => {
        setSelectedHistory(history);
        onVisibleModal();
      },
      [onVisibleModal],
    );

    const onCloseModal = useCallback(() => {
      setVisibleCreateOrEditModal(false);
      setSelectedHistory(undefined);
    }, []);

    const onDeliverySubmitted = useCallback(
      (history: any) => {
        const { id } = history;
        if (isEmpty(id)) {
          dispatch(actions.addNew(history));
        } else {
          dispatch(actions.update(history));
        }
      },
      [dispatch],
    );

    const onDelete = useCallback(
      (history: BillDeliveryHistory) => () => {
        const { id } = history;
        if (id) {
          dispatch(actions.delete(id));
        }
      },
      [dispatch],
    );

    const onRestore = useCallback(() => {
      if (isDirty) {
        showConfirm(
          'Dữ liệu chưa được lưu, bạn có chắc muốn trả lại trạng thái lúc đâu?',
          () => {
            dispatch(actions.restore());
          },
        );
      }
    }, [dispatch, isDirty]);

    const onSave = useCallback(() => {
      if (isDirty) {
        dispatch(actions.save(bill.id));
      }
    }, [bill.id, dispatch, isDirty]);

    const maxHeight = window.innerHeight - window.innerHeight * 0.3;

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
                onClick={onVisibleModal}
                icon={<PlusOutlined />}
                disabled={isSaving}
              />
            </Tooltip>
            {isDirty && (
              <Alert
                banner
                showIcon
                message="Có thay đổi dữ liệu, nhớ bấm Lưu để tránh mất dữ liệu"
              />
            )}
          </Space>
        }
        size={size}
        loading={isFetching}
        actions={[
          <Button
            type="ghost"
            icon={<SaveOutlined />}
            style={{ border: 0 }}
            loading={isSaving}
            onClick={onSave}
            disabled={!isDirty}
          >
            Lưu thay đổi
          </Button>,
          <Button
            type="ghost"
            icon={<ClearOutlined />}
            style={{ border: 0 }}
            onClick={onRestore}
            disabled={isSaving || !isDirty}
          >
            Hủy thay đổi
          </Button>,
        ]}
      >
        <div style={{ maxHeight, overflow: 'auto' }}>
          {isEmpty(histories) ? (
            <Empty description="Chưa có thông tin tình trạng hàng" />
          ) : (
            map((groupedHistory: GroupedHistory) => {
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
                      <Text strong>
                        {groupedHistory.date || '<Không có ngày>'}
                      </Text>
                      <Tooltip title="Thêm tình trạng hàng vào ngày này">
                        <Button
                          size="small"
                          shape="circle"
                          type="primary"
                          ghost
                          icon={<PlusOutlined />}
                          onClick={onAddNewAtADate(groupedHistory)}
                          disabled={isSaving}
                        />
                      </Tooltip>
                    </Space>
                  </div>

                  <Timeline>
                    {map((history: BillDeliveryHistory) => {
                      const { time, status } = history;
                      return (
                        <Timeline.Item key={uniqueId('gh_tl_')}>
                          <div
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            {time && (
                              <Text strong style={{ marginRight: 5 }}>
                                {moment(time).format('HH:mm')}:
                              </Text>
                            )}
                            <Text style={{ marginRight: 5 }}>{status}</Text>
                            <EditOutlined
                              style={{ cursor: 'pointer', marginRight: 5 }}
                              onClick={onEdit(history)}
                              disabled={isSaving}
                            />
                            <DeleteOutlined
                              style={{ cursor: 'pointer', color: 'red' }}
                              onClick={onDelete(history)}
                              disabled={isSaving}
                            />
                          </div>
                        </Timeline.Item>
                      );
                    })(groupedHistory.histories)}
                  </Timeline>
                </div>
              );
            })(histories)
          )}
        </div>
        <DeliveryHistoryModal
          visible={visibleCreateOrEditModal}
          onClose={onCloseModal}
          airLineBillId={bill.airlineBillId}
          childBillId={bill.childBillId}
          onSubmitted={onDeliverySubmitted}
          selectedHistory={selectedHistory}
        />
      </ContentContainer>
    );
  },
);
