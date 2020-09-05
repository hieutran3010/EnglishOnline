import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { Modal, Table } from 'antd';
import ParcelService from 'app/models/parcelService';
import {
  COLUMN_TYPES,
  ColumnDefinition,
} from 'app/components/collection/DataGrid';

interface Props {
  visible: boolean;
  services: ParcelService[];
  isFetching: boolean;
  onClose: () => void;
  assignedServiceIds: string[];
  isFetchingAssignedServiceIds: boolean;
  onSubmit: (selectedServiceIds: string[]) => void;
  isSubmitting: boolean;
}
const ServiceSelectionModal = ({
  visible,
  services,
  isFetching,
  onClose,
  assignedServiceIds,
  isFetchingAssignedServiceIds,
  onSubmit,
  isSubmitting,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(assignedServiceIds);
  }, [assignedServiceIds]);

  const _onClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const _onOk = useCallback(() => {
    onSubmit(selectedIds);
  }, [onSubmit, selectedIds]);

  const columns = useMemo((): ColumnDefinition[] => {
    return [
      {
        title: 'Tên dịch vụ',
        dataIndex: 'name',
        key: 'name',
        canFilter: true,
        type: COLUMN_TYPES.STRING,
      },
    ];
  }, []);

  const rowSelection = useMemo(() => {
    return {
      onChange: (selectedRowKeys, _selectedRows) => {
        setSelectedIds(selectedRowKeys);
      },
    };
  }, []);

  return (
    <Modal
      visible={visible}
      onCancel={_onClose}
      onOk={_onOk}
      title="Chỉ định dịch vụ"
      confirmLoading={isSubmitting}
      closable={!isSubmitting}
    >
      <Table
        dataSource={services}
        rowKey={r => r.id}
        columns={columns}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedIds,
          ...rowSelection,
        }}
        loading={isFetching || isFetchingAssignedServiceIds || isSubmitting}
        size="small"
        pagination={false}
      />
    </Modal>
  );
};

export default memo(ServiceSelectionModal);
