import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { Store } from 'antd/lib/form/interface';
import isEmpty from 'lodash/fp/isEmpty';
import filter from 'lodash/fp/filter';
import toString from 'lodash/fp/toString';

import getZoneValidator from 'app/models/validators/zoneValidator';
import { CountrySelect } from 'app/components/Select';
import { ExcludedCountry } from 'app/components/Select/CountrySelect';
import Zone from 'app/models/zone';

interface Props {
  onSaveZone?: (zone) => void;
  onCancel?: () => void;
  visible: boolean;
  isSubmittingZone: boolean;
  mappedCountries?: ExcludedCountry[];
  zone?: Zone;
  vendorId: string;
}
const ZoneCreationModal = ({
  onSaveZone,
  onCancel,
  visible,
  isSubmittingZone,
  mappedCountries,
  zone,
  vendorId,
}: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(zone as Store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone]);

  const _onOk = useCallback(() => {
    form.submit();
  }, [form]);

  const _onCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    form.resetFields();
  }, [onCancel, form]);

  const onSubmitZone = useCallback(
    formZone => {
      if (onSaveZone) {
        onSaveZone(formZone);
      }
    },
    [onSaveZone],
  );

  const onRefresh = useCallback(() => {
    form.resetFields();
  }, [form]);

  const zoneValidator = useMemo(() => getZoneValidator(vendorId, zone?.id), [
    vendorId,
    zone,
  ]);
  const filteredMappedCountries = useMemo(() => {
    if (zone) {
      const { countries } = zone;
      if (countries && !isEmpty(countries)) {
        return filter(
          (c: ExcludedCountry) => !countries.includes(toString(c.country)),
        )(mappedCountries);
      }
    }
  }, [mappedCountries, zone]);

  return (
    <Modal
      title={zone && !isEmpty(zone.id) ? 'Cập nhật Zone' : 'Thêm Zone mới'}
      visible={visible}
      onOk={_onOk}
      onCancel={_onCancel}
      cancelText="Đóng"
      footer={[
        <Button key={1} onClick={_onCancel} disabled={isSubmittingZone}>
          Đóng
        </Button>,
        <Button key={2} onClick={onRefresh} disabled={isSubmittingZone}>
          Làm Mới
        </Button>,
        <Button
          key={3}
          type="primary"
          onClick={_onOk}
          loading={isSubmittingZone}
        >
          Ok
        </Button>,
      ]}
    >
      <Form form={form} onFinish={onSubmitZone} layout="vertical">
        <Form.Item label="Tên Zone" name="name" rules={zoneValidator.name}>
          <Input
            ref={ref => ref?.select()}
            style={{ textTransform: 'uppercase' }}
            disabled={isSubmittingZone}
          />
        </Form.Item>
        <Form.Item
          label="Gồm các Quốc Gia"
          name="countries"
          rules={zoneValidator.countries}
          valuePropName="value"
        >
          <CountrySelect
            excludeCountries={filteredMappedCountries}
            disabled={isSubmittingZone}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

ZoneCreationModal.defaultProps = {
  isSubmittingZone: false,
  visible: false,
};

export default memo(ZoneCreationModal);
