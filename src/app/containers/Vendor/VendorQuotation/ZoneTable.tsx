import React, { memo, useMemo, useCallback } from 'react';
import { Table, Space, Button, Divider } from 'antd';
import type Zone from 'app/models/zone';
import { getLocalColumnSearchProps } from 'app/components/collection/DataGrid/SearchControls';
import { ColumnDefinition } from 'app/components/collection/DataGrid';
import { showConfirm } from 'app/components/Modal/utils';

interface Props {
  isLoading?: boolean;
  zones: Zone[];
  onUpdateZone?: (zone: Zone) => void;
  onDeleteZone?: (zone: Zone) => void;
}
const ZoneTable = ({ zones, isLoading, onUpdateZone, onDeleteZone }: Props) => {
  const _onUpdateZone = useCallback(
    (zone: Zone) => () => {
      if (onUpdateZone) {
        onUpdateZone(zone);
      }
    },
    [onUpdateZone],
  );

  const _onDeleteZone = useCallback(
    (zone: Zone) => () => {
      if (onDeleteZone) {
        onDeleteZone(zone);
      }
    },
    [onDeleteZone],
  );

  const onConfirmDeleteZone = useCallback(
    (zone: Zone) => () => {
      showConfirm(
        `Bạn có chắc muốn xóa zone ${zone.name}. Tất cả giá liên quan tới Zone này sẽ bị xóa và không có khả năng phục hồi! Bạn có chắc muốn tiếp tục xóa?`,
        _onDeleteZone(zone),
      );
    },
    [_onDeleteZone],
  );

  const zoneColumns = useMemo((): ColumnDefinition[] => {
    return [
      {
        title: 'Tên Zone',
        dataIndex: 'name',
        key: 'name',
        width: 100,
        ...getLocalColumnSearchProps('name'),
      },
      {
        title: 'Gồm các Quốc Gia',
        dataIndex: 'countries',
        key: 'countries',
        width: 100,
        render: data => {
          return <span>{data.join(', ')}</span>;
        },
        ...getLocalColumnSearchProps('countries'),
      },
      {
        title: 'Tác Vụ',
        key: 'action',
        render: record => (
          <Space size={1}>
            <Button size="small" type="link" onClick={_onUpdateZone(record)}>
              Sửa
            </Button>
            <Divider type="vertical" />
            <Button
              size="small"
              type="link"
              danger
              onClick={onConfirmDeleteZone(record)}
            >
              Xóa
            </Button>
          </Space>
        ),
        width: 50,
      },
    ];
  }, [_onUpdateZone, onConfirmDeleteZone]);

  return (
    <Table
      size="small"
      dataSource={zones}
      columns={zoneColumns}
      locale={{ emptyText: 'Nhà cung cấp này chưa được nhập Zone nào :(' }}
      loading={isLoading}
      pagination={false}
      rowKey={(record: any) => record.id}
    />
  );
};

export default memo(ZoneTable);
