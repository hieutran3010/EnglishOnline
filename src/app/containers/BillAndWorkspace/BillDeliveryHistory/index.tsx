/**
 *
 * BillDeliveryHistory
 *
 */

import React, {
  memo,
  useEffect,
  useState,
  useCallback,
  useMemo,
  CSSProperties,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Space, Button, Tooltip, Alert, Spin } from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  ClearOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import isEmpty from 'lodash/fp/isEmpty';
import moment from 'moment';

import { ContentContainer } from 'app/components/Layout';
import { BillDeliveryHistory } from 'app/models/bill';
import useBillDeliveryHistory from './hook';
import { actions } from './slice';
import {
  selectIsFetchingHistories,
  selectHistories,
  selectIsDirty,
  selectIsSaving,
  selectAirlineBillId,
  selectChildBillId,
  selectViewableBill,
  selectIsFetchingBillToView,
} from './selectors';
import DeliveryHistoryModal from './DeliveryHistoryModal';
import { showConfirm } from 'app/components/Modal/utils';
import { useParams } from 'react-router-dom';
import BillView from '../components/BillView';
import Modal from 'antd/lib/modal/Modal';
import DeliveryTimeline from './DeliveryTimeline';
import BillTrackingId from '../components/BillTrackingId';

const { Text } = Typography;

interface Props {
  delegateControl?: boolean;
  size?: 'small' | 'default' | undefined;
  isReadOnly?: boolean;
  notAbleToViewBillInfo?: boolean;
  bodyStyle?: CSSProperties;
}
export const BillDeliveryHistoryPage = memo(
  ({
    delegateControl,
    size,
    isReadOnly,
    notAbleToViewBillInfo,
    bodyStyle,
  }: Props) => {
    const dispatch = useDispatch();
    if (!delegateControl) {
      useBillDeliveryHistory();
    }

    const { billId } = useParams() as any;
    const airlineBillId = useSelector(selectAirlineBillId);
    const childBillId = useSelector(selectChildBillId);

    const [showBillViewModal, setShowBillViewModal] = useState(false);

    useEffect(() => {
      return function cleanUp() {
        dispatch(actions.reset());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [visibleCreateOrEditModal, setVisibleCreateOrEditModal] = useState(
      false,
    );

    const [selectedHistory, setSelectedHistory] = useState<
      BillDeliveryHistory | undefined
    >();

    useEffect(() => {
      if (billId) {
        dispatch(actions.fetchBillDeliveryHistories(billId));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId]);

    const isFetching = useSelector(selectIsFetchingHistories);
    const histories = useSelector(selectHistories);
    const isDirty = useSelector(selectIsDirty);
    const isSaving = useSelector(selectIsSaving);
    const viewableBill = useSelector(selectViewableBill);
    const isFetchingViewableBill = useSelector(selectIsFetchingBillToView);

    const onVisibleModal = useCallback(() => {
      setVisibleCreateOrEditModal(true);
    }, []);

    const onAddNewAtADate = useCallback(
      (date: any) => {
        setSelectedHistory({ date, time: moment() });
        onVisibleModal();
      },
      [onVisibleModal],
    );

    const onAddNew = useCallback(() => {
      setSelectedHistory(undefined);
      onVisibleModal();
    }, [onVisibleModal]);

    const onEdit = useCallback(
      (history: BillDeliveryHistory) => {
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
      (history: BillDeliveryHistory) => {
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
        dispatch(actions.save());
      }
    }, [dispatch, isDirty]);

    const onViewBill = useCallback(() => {
      dispatch(actions.fetchBillToView(billId));
      setShowBillViewModal(true);
    }, [billId, dispatch]);

    const onCancelViewBill = useCallback(() => {
      setShowBillViewModal(false);
    }, []);

    const mainActions = useMemo(() => {
      return isReadOnly === true
        ? []
        : [
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
          ];
    }, [isDirty, isReadOnly, isSaving, onRestore, onSave]);

    return (
      <ContentContainer
        bodyStyle={bodyStyle}
        title={
          <Space>
            <Text>Tình trạng bill</Text>
            {isFetching ? (
              <Spin size="small" />
            ) : (
              <BillTrackingId
                airlineBillId={airlineBillId}
                childBillId={childBillId}
              />
            )}
            <Space>
              {!isReadOnly && (
                <Tooltip title="Thêm tình trạng mới">
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    onClick={onAddNew}
                    icon={<PlusOutlined />}
                    disabled={isSaving}
                  />
                </Tooltip>
              )}
              {!notAbleToViewBillInfo && (
                <Tooltip title="Xem thông tin bill này">
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<EyeOutlined />}
                    loading={isFetchingViewableBill}
                    onClick={onViewBill}
                  />
                </Tooltip>
              )}
            </Space>
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
        actions={mainActions}
      >
        <DeliveryTimeline
          isReadOnly={isReadOnly}
          onAddNewAtADate={onAddNewAtADate}
          onEdit={onEdit}
          onDelete={onDelete}
          histories={histories}
          isSaving={isSaving}
        />
        <DeliveryHistoryModal
          visible={visibleCreateOrEditModal}
          onClose={onCloseModal}
          airLineBillId={airlineBillId}
          childBillId={childBillId}
          onSubmitted={onDeliverySubmitted}
          selectedHistory={selectedHistory}
        />
        {!notAbleToViewBillInfo && viewableBill && (
          <Modal
            onOk={onCancelViewBill}
            onCancel={onCancelViewBill}
            footer={[
              <Button key="back" type="primary" onClick={onCancelViewBill}>
                Ok
              </Button>,
            ]}
            visible={showBillViewModal}
            width="100%"
            centered
          >
            <BillView bill={viewableBill} />
          </Modal>
        )}
      </ContentContainer>
    );
  },
);
