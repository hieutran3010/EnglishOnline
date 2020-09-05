import { Modal, Space, Typography, List } from 'antd';
import React, { memo, useMemo } from 'react';
import map from 'lodash/fp/map';
import ParcelService from 'app/models/parcelService';
import ZoneTable from '../components/ZoneTable';
import Vendor from 'app/models/vendor';

const { Title } = Typography;

const onRenderVendorItem = (vendor: Vendor) => {
  return <List.Item>{vendor.name}</List.Item>;
};

interface Props {
  service?: ParcelService & any;
  visible?: boolean;
  onClose?: () => void;
}
const ServiceView = ({ service, visible, onClose }: Props) => {
  const { name, parcelServiceZones, parcelServiceVendors } = service || {};

  const vendors = useMemo(() => {
    return map((sv: any) => sv.vendor)(parcelServiceVendors);
  }, [parcelServiceVendors]);

  return (
    <Modal
      visible={visible}
      title={name}
      onOk={onClose}
      onCancel={onClose}
      width="100%"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4} type="secondary">
          Zone
        </Title>
        <ZoneTable zones={parcelServiceZones} isReadOnly />
        <Title level={4} type="secondary">
          Các NCC đang sử dụng
        </Title>
        <List
          size="small"
          dataSource={vendors}
          renderItem={onRenderVendorItem}
          bordered
        />
      </Space>
    </Modal>
  );
};

export default memo(ServiceView);
