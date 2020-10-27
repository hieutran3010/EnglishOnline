import React, { memo, useMemo, useCallback, ReactElement } from 'react';
import { Table, Space, Button, Divider, Typography } from 'antd';
import type Zone from 'app/models/zone';
import { getLocalColumnSearchProps } from 'app/components/collection/DataGrid/SearchControls';
import { ColumnDefinition } from 'app/components/collection/DataGrid';
import { showConfirm } from 'app/components/Modal/utils';
import { ParcelServiceZone } from 'app/models/parcelService';

const { Text } = Typography;

interface Props {
  isLoading?: boolean;
  zones: (Zone | ParcelServiceZone)[];
  onUpdateZone?: (zone: Zone | ParcelServiceZone) => void;
  onDeleteZone?: (zone: Zone | ParcelServiceZone) => void;
  onRenderZoneName?: (zoneName: string) => ReactElement;
  isReadOnly?: boolean;
  canUpdateZone?: (zone: Zone | ParcelServiceZone) => boolean;
  canDeleteZone?: (zone: Zone | ParcelServiceZone) => boolean;
}
const ZoneTable = ({
  zones,
  isLoading,
  onUpdateZone,
  onDeleteZone,
  onRenderZoneName,
  isReadOnly,
  canUpdateZone,
  canDeleteZone,
}: Props) => {
  const _onUpdateZone = useCallback(
    (zone: Zone | ParcelServiceZone) => () => {
      if (onUpdateZone) {
        onUpdateZone(zone);
      }
    },
    [onUpdateZone],
  );

  const _onDeleteZone = useCallback(
    (zone: Zone | ParcelServiceZone) => () => {
      if (onDeleteZone) {
        onDeleteZone(zone);
      }
    },
    [onDeleteZone],
  );

  const onConfirmDeleteZone = useCallback(
    (zone: Zone | ParcelServiceZone) => () => {
      showConfirm(
        `Bạn có chắc muốn xóa zone ${zone.name}. Tất cả giá liên quan tới Zone này sẽ bị xóa và không có khả năng phục hồi! Bạn có chắc muốn tiếp tục xóa?`,
        _onDeleteZone(zone),
      );
    },
    [_onDeleteZone],
  );

  const zoneColumns = useMemo((): ColumnDefinition[] => {
    const result = [
      {
        title: 'Tên Zone',
        dataIndex: 'name',
        key: 'name',
        width: 50,
        ...getLocalColumnSearchProps('name'),
        render: (value: string) => {
          if (onRenderZoneName) {
            return onRenderZoneName(value);
          }

          return <Text>{value}</Text>;
        },
      },
      {
        title: 'Gồm các Quốc Gia',
        dataIndex: 'countries',
        key: 'countries',
        width: 300,
        render: data => {
          return <span>{data.join(', ')}</span>;
        },
        ...getLocalColumnSearchProps('countries'),
      },
      {
        title: 'Tác Vụ',
        key: 'action',
        render: (record: Zone | ParcelServiceZone) => {
          if (isReadOnly) {
            return <></>;
          }

          return (
            <Space size={1}>
              {(!canUpdateZone || (canUpdateZone && canUpdateZone(record))) && (
                <Button
                  size="small"
                  type="link"
                  onClick={_onUpdateZone(record)}
                >
                  Sửa
                </Button>
              )}
              {(!canDeleteZone || (canDeleteZone && canDeleteZone(record))) && (
                <>
                  <Divider type="vertical" />
                  <Button
                    size="small"
                    type="link"
                    danger
                    onClick={onConfirmDeleteZone(record)}
                  >
                    Xóa
                  </Button>
                </>
              )}
            </Space>
          );
        },
        width: 50,
      },
    ];

    if (isReadOnly) {
      result.pop();
    }

    return result;
  }, [
    _onUpdateZone,
    canDeleteZone,
    canUpdateZone,
    isReadOnly,
    onConfirmDeleteZone,
    onRenderZoneName,
  ]);

  return (
    <Table
      size="small"
      dataSource={zones}
      columns={zoneColumns}
      loading={isLoading}
      pagination={false}
      rowKey={(record: any) => record.id}
    />
  );
};

export default memo(ZoneTable);
