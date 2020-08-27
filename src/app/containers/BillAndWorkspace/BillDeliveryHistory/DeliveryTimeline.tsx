import React, { memo, useMemo, useCallback } from 'react';
import { Space, Typography, Tooltip, Button, Timeline } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import uniqueId from 'lodash/fp/uniqueId';
import isEmpty from 'lodash/fp/isEmpty';
import orderBy from 'lodash/fp/orderBy';
import groupBy from 'lodash/fp/groupBy';
import keys from 'lodash/fp/keys';
import map from 'lodash/fp/map';
import moment from 'moment';

import { BillDeliveryHistory } from 'app/models/bill';
import { GroupedHistory } from './types';

const { Text } = Typography;

interface Props {
  isReadOnly?: boolean;
  isSaving: boolean;
  histories: BillDeliveryHistory[];
  onEdit: (history: BillDeliveryHistory) => void;
  onDelete: (history: BillDeliveryHistory) => void;
  onAddNewAtADate: (date: any) => void;
}
const DeliveryTimeline = ({
  isReadOnly,
  isSaving,
  histories,
  onEdit,
  onDelete,
  onAddNewAtADate,
}: Props) => {
  const groupedHistories = useMemo((): GroupedHistory[] => {
    if (!isEmpty(histories)) {
      const orderedHistories = orderBy('date')('desc')(histories);

      const groupedByDate = groupBy((bdh: BillDeliveryHistory) => bdh.date)(
        orderedHistories,
      );

      const dates = keys(groupedByDate);
      const result: GroupedHistory[] = map(
        (groupedKey: string): GroupedHistory => {
          const values = groupedByDate[groupedKey];

          const isValidDate =
            groupedKey !== null &&
            groupedKey !== undefined &&
            groupedKey !== 'null' &&
            groupedKey !== 'undefined';
          const date = isValidDate
            ? moment(groupedKey).format('DD-MM-YYYY')
            : null;

          const historyValues = orderBy('time')('desc')(
            values,
          ) as BillDeliveryHistory[];

          return {
            date,
            histories: historyValues,
            rawDate: isValidDate ? groupedKey : undefined,
          };
        },
      )(dates);

      return result;
    }

    return [];
  }, [histories]);

  const _onEdit = useCallback(
    (history: BillDeliveryHistory) => () => {
      if (onEdit) {
        onEdit(history);
      }
    },
    [onEdit],
  );

  const _onDelete = useCallback(
    (history: BillDeliveryHistory) => () => {
      if (onDelete) {
        onDelete(history);
      }
    },
    [onDelete],
  );

  const _onAddNewAtADate = useCallback(
    (groupedHistory: GroupedHistory) => () => {
      if (onAddNewAtADate) {
        onAddNewAtADate(groupedHistory.rawDate);
      }
    },
    [onAddNewAtADate],
  );

  return (
    <>
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
                {!isReadOnly && (
                  <Tooltip title="Thêm tình trạng hàng vào ngày này">
                    <Button
                      size="small"
                      shape="circle"
                      type="primary"
                      ghost
                      icon={<PlusOutlined />}
                      onClick={_onAddNewAtADate(groupedHistory)}
                      disabled={isSaving}
                    />
                  </Tooltip>
                )}
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
                      {!isReadOnly && (
                        <>
                          <EditOutlined
                            style={{ cursor: 'pointer', marginRight: 5 }}
                            onClick={_onEdit(history)}
                            disabled={isSaving}
                          />
                          <DeleteOutlined
                            style={{ cursor: 'pointer', color: 'red' }}
                            onClick={_onDelete(history)}
                            disabled={isSaving}
                          />
                        </>
                      )}
                    </div>
                  </Timeline.Item>
                );
              })(groupedHistory.histories)}
            </Timeline>
          </div>
        );
      })(groupedHistories)}
    </>
  );
};

export default memo(DeliveryTimeline);
