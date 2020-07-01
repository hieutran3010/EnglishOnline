/**
 *
 * VendorQuotationCu
 *
 */

import React, { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Form, InputNumber, Typography, Space, Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Store } from 'antd/lib/form/interface';
import { toast } from 'react-toastify';
import toUpper from 'lodash/fp/toUpper';
import isEmpty from 'lodash/fp/isEmpty';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import getVendorValidator from 'app/models/validators/vendorValidator';
import Zone from 'app/models/zone';

import { actions, reducer, sliceKey } from './slice';
import {
  selectVendor,
  selectIsFetchingVendor,
  selectIsSubmittingZone,
  selectIsFetchingZones,
  selectZones,
  selectMappedCountries,
  selectIsEditingVendor,
} from './selectors';
import { vendorQuotationSaga } from './saga';
import ZoneCreationModal from './components/ZoneCreationModal';
import ZoneTable from './ZoneTable';

const { Title } = Typography;

export const VendorQuotation = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: vendorQuotationSaga });

  const history = useHistory();
  const [vendorForm] = Form.useForm();
  const dispatch = useDispatch();
  const { vendorId } = useParams();

  const [visibleZoneCreationModal, setVisibleZoneCreationModal] = useState(
    false,
  );
  const [editingZone, setEditingZone] = useState<Zone>(new Zone());

  const vendor = useSelector(selectVendor);
  const isFetchingVendor = useSelector(selectIsFetchingVendor);
  const isSubmittingZone = useSelector(selectIsSubmittingZone);
  const zones = useSelector(selectZones);
  const isFetchingZones = useSelector(selectIsFetchingZones);
  const mappedCountries = useSelector(selectMappedCountries);
  const isEditingVendor = useSelector(selectIsEditingVendor);

  useEffect(() => {
    dispatch(actions.fetchVendor(vendorId));
    dispatch(actions.fetchZones(vendorId));
  }, [dispatch, vendorId]);

  useEffect(() => {
    vendorForm.setFieldsValue(vendor as Store);
  }, [vendorForm, vendor]);

  const onSaveVendor = useCallback(
    updatePatch => {
      dispatch(actions.updateVendor(updatePatch));
    },
    [dispatch],
  );

  const onGoBack = useCallback(() => {
    history.push('/vendors');
  }, [history]);

  const onCancelZoneCreationModal = useCallback(() => {
    setVisibleZoneCreationModal(false);
    setEditingZone(new Zone());
  }, []);

  const onCreateNewZone = useCallback(() => {
    setVisibleZoneCreationModal(true);
  }, []);

  const onSaveZone = useCallback(
    zone => {
      zone.vendorId = vendorId;
      zone.name = toUpper(zone.name);
      if (isEmpty(editingZone.id)) {
        // create mode
        dispatch(actions.submitANewZone(zone));
      } else {
        // update mode
        zone.id = editingZone.id;
        dispatch(actions.updateZone(zone));
      }
    },
    [dispatch, vendorId, editingZone],
  );

  const onUpdateZone = useCallback((zone: Zone) => {
    setEditingZone(zone);
    setVisibleZoneCreationModal(true);
  }, []);

  const onDeleteZone = useCallback(
    (zone: Zone) => {
      toast(
        `Đã ra lệnh xóa zone ${zone.name}. Dữ liệu sẽ tự động tải lại sau khi xóa hoàn tất!`,
      );
      dispatch(actions.deleteZone(zone));
    },
    [dispatch],
  );

  const onNavigateQuotationDetailPage = useCallback(() => {
    history.push(`/vendorQuotationDetail/${vendorId}`);
  }, [history, vendorId]);

  const title = `Phí & Zone của ${vendor.name} `;

  const vendorValidator = useMemo(() => getVendorValidator(vendorId), [
    vendorId,
  ]);

  return (
    <RootContainer
      title={title}
      subTitle="Cập nhật thông tin Phí & Zone"
      onBack={onGoBack}
      rightComponents={[
        <Button key="1" type="primary" onClick={onNavigateQuotationDetailPage}>
          Báo Giá
        </Button>,
      ]}
    >
      <ContentContainer loading={isFetchingVendor}>
        <Form layout="vertical" form={vendorForm} onFinish={onSaveVendor}>
          <Form.Item
            label="Phí nhiên liệu (%)"
            name="fuelChargePercent"
            rules={vendorValidator.fuelChargePercent}
            initialValue={0}
          >
            <InputNumber
              precision={3}
              min={0}
              autoFocus
              disabled={isEditingVendor}
            />
          </Form.Item>

          <Form.Item
            label="Phí khác (USD)"
            name="otherFeeInUsd"
            initialValue={0}
            rules={vendorValidator.otherFeeInUsd}
          >
            <InputNumber precision={2} min={0} disabled={isEditingVendor} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isEditingVendor}
              >
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <Space align="center">
          <Title type="secondary" level={4}>
            Zone
          </Title>
          <Tooltip title="Thêm một Zone mới">
            <Button
              icon={<PlusOutlined />}
              type="primary"
              shape="circle"
              size="small"
              style={{ marginBottom: 7 }}
              onClick={onCreateNewZone}
            />
          </Tooltip>
        </Space>
        <ZoneTable
          zones={zones}
          isLoading={isFetchingZones}
          onUpdateZone={onUpdateZone}
          onDeleteZone={onDeleteZone}
        />
        <ZoneCreationModal
          visible={visibleZoneCreationModal}
          onCancel={onCancelZoneCreationModal}
          onSaveZone={onSaveZone}
          isSubmittingZone={isSubmittingZone}
          mappedCountries={mappedCountries}
          zone={editingZone}
          vendorId={vendorId}
        />
      </ContentContainer>
    </RootContainer>
  );
});
