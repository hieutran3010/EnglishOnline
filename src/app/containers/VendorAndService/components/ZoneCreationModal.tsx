import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { Store } from 'antd/lib/form/interface';
import isEmpty from 'lodash/fp/isEmpty';
import filter from 'lodash/fp/filter';
import toString from 'lodash/fp/toString';
import { trim, toUpper } from 'lodash';

import { ZoneValidator } from 'app/models/validators/zoneValidator';
import { CountrySelect } from 'app/components/Select';
import { ExcludedCountry } from 'app/components/Select/CountrySelect';
import Zone from 'app/models/zone';
import { ParcelServiceZoneValidator } from 'app/models/validators/parcelServiceZoneValidator';
import { ParcelServiceZone } from 'app/models/parcelService';

interface Props {
  onSubmit?: (zone) => void;
  onCancel?: () => void;
  onRefresh: () => void;
  visible: boolean;
  isSubmittingZone: boolean;
  mappedCountries?: ExcludedCountry[];
  zone?: Zone | ParcelServiceZone;
  validator: ZoneValidator | ParcelServiceZoneValidator;
}
const ZoneCreationModal = ({
  onSubmit,
  onCancel,
  visible,
  isSubmittingZone,
  mappedCountries,
  zone,
  validator,
  onRefresh,
}: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (zone) {
      form.setFieldsValue(zone as Store);
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone]);

  const _onOk = useCallback(() => {
    form.submit();
  }, [form]);

  const _onCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const onSubmitZone = useCallback(
    formZone => {
      if (onSubmit) {
        if (zone && !isEmpty(zone.id)) {
          formZone.id = zone.id;
        }
        formZone.name = toUpper(trim(formZone.name));
        onSubmit(formZone);
      }
    },
    [onSubmit, zone],
  );

  const filteredMappedCountries = useMemo(() => {
    if (zone) {
      const { countries } = zone;
      if (countries && !isEmpty(countries)) {
        return filter(
          (c: ExcludedCountry) => !countries.includes(toString(c.country)),
        )(mappedCountries);
      }
    }
    return mappedCountries;
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
        <Form.Item label="Tên Zone" name="name" rules={validator.name}>
          <Input
            ref={ref => ref?.select()}
            style={{ textTransform: 'uppercase' }}
            disabled={isSubmittingZone}
          />
        </Form.Item>
        <Form.Item
          label="Gồm các Quốc Gia"
          name="countries"
          rules={validator.countries}
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
