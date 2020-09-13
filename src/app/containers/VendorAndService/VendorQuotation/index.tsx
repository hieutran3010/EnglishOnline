/**
 *
 * VendorQuotationCu
 *
 */

import React, { memo, useEffect, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory, Link } from 'react-router-dom';
import { Form, InputNumber, Space, Button, Tooltip, Typography } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import { Store } from 'antd/lib/form/interface';
import map from 'lodash/fp/map';
import isEmpty from 'lodash/fp/isEmpty';
import find from 'lodash/fp/find';

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
  selectIsEditingVendor,
  selectEditingZone,
  selectIsFetchingParcelServices,
  selectParcelServices,
  selectIsFetchingAssignedParcelServices,
  selectAssignedParcelServices,
  selectIsSubmittingSelectedServices,
} from './selectors';
import { vendorQuotationSaga } from './saga';
import { authorizeHelper, authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import ZoneCreateOrEdit from '../components/ZoneCreateOrEdit';
import getZoneValidator from 'app/models/validators/zoneValidator';
import ServiceSelectionModal from './ServiceSelectionModal';
import ParcelService from 'app/models/parcelService';
import { ZONE_VENDOR_ASSOCIATION_SEPARATOR } from '../constants';

const { Text } = Typography;

export const VendorQuotation = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: vendorQuotationSaga });

  const currentRole = authStorage.getRole();
  const history = useHistory();
  const [vendorForm] = Form.useForm();
  const dispatch = useDispatch();
  const { vendorId } = useParams() as any;

  const vendor = useSelector(selectVendor);
  const isFetchingVendor = useSelector(selectIsFetchingVendor);
  const isSubmittingZone = useSelector(selectIsSubmittingZone);
  const zones = useSelector(selectZones);
  const isFetchingZones = useSelector(selectIsFetchingZones);
  const isEditingVendor = useSelector(selectIsEditingVendor);
  const editingZone = useSelector(selectEditingZone);
  const isFetchingServices = useSelector(selectIsFetchingParcelServices);
  const parcelServices = useSelector(selectParcelServices);
  const isFetchingAssignedServices = useSelector(
    selectIsFetchingAssignedParcelServices,
  );
  const assignedParcelServices = useSelector(selectAssignedParcelServices);
  const isSubmittingSelectedServices = useSelector(
    selectIsSubmittingSelectedServices,
  );

  const [
    visibleServiceSelectionModal,
    setVisibleServiceSelectionModal,
  ] = useState(false);

  useEffect(() => {
    dispatch(actions.fetchVendor(vendorId));
    dispatch(actions.fetchZones(vendorId));
    dispatch(actions.fetchParcelServices());
    dispatch(actions.fetchAssignedServices(vendorId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

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
    history.push('/vendors-and-services/vendors');
  }, [history]);

  const onSubmitZone = useCallback(
    (zone: Zone | any) => {
      dispatch(actions.addOrUpdateZone(zone));
    },
    [dispatch],
  );

  const onUpdateZone = useCallback(
    (zone: Zone | any) => {
      dispatch(actions.setEditingZone(zone));
    },
    [dispatch],
  );

  const onDisposeCreationModal = useCallback(() => {
    dispatch(actions.setEditingZone(undefined));
  }, [dispatch]);

  const onDeleteZone = useCallback(
    (zone: Zone | any) => {
      dispatch(actions.deleteZone(zone));
    },
    [dispatch],
  );

  const onNavigateQuotationDetailPage = useCallback(() => {
    history.push(`/vendorQuotationDetail/${vendorId}`);
  }, [history, vendorId]);

  const onVisibleServiceSelectionModal = useCallback(() => {
    setVisibleServiceSelectionModal(true);
  }, []);

  const onCloseServiceSelectionModal = useCallback(() => {
    setVisibleServiceSelectionModal(false);
  }, []);

  const onSubmitServiceAssignments = useCallback(
    (serviceIds: string[]) => {
      dispatch(actions.submitSelectedServices(serviceIds));
    },
    [dispatch],
  );

  const onRenderZoneName = useCallback(
    (zoneName: string) => {
      if (zoneName.includes(ZONE_VENDOR_ASSOCIATION_SEPARATOR)) {
        const fragments = zoneName.split(ZONE_VENDOR_ASSOCIATION_SEPARATOR);
        const [serviceName, serviceZoneName] = fragments;
        const service = find((s: ParcelService) => s.name === serviceName)(
          parcelServices,
        );
        return (
          <Link
            to={`/serviceUpdating/${service?.id}?zoneName=${serviceZoneName}`}
          >
            {zoneName}
          </Link>
        );
      }

      return <Text>{zoneName}</Text>;
    },
    [parcelServices],
  );

  const title = `Phí & Zone của ${vendor.name} `;

  const vendorValidator = useMemo(() => getVendorValidator(vendorId), [
    vendorId,
  ]);

  const zoneValidator = useMemo(() => {
    let selectedServiceNames: string[] = [];
    if (!isEmpty(parcelServices)) {
      selectedServiceNames = map((s: ParcelService) => s.name)(parcelServices);
    }
    return getZoneValidator(vendorId, editingZone?.id, selectedServiceNames);
  }, [parcelServices, editingZone, vendorId]);

  const rightActions =
    currentRole === Role.ADMIN
      ? [
          <Button
            key="1"
            type="primary"
            onClick={onNavigateQuotationDetailPage}
          >
            Báo Giá
          </Button>,
        ]
      : [];

  return (
    <RootContainer
      title={title}
      subTitle="Cập nhật thông tin Phí & Zone"
      onBack={onGoBack}
      rightComponents={rightActions}
    >
      <ContentContainer loading={isFetchingVendor}>
        <Form
          layout="vertical"
          form={vendorForm}
          onFinish={onSaveVendor}
          initialValues={{ otherFeeInUsd: 0, fuelChargePercent: 0 }}
        >
          <Form.Item
            label="Phí nhiên liệu (%)"
            name="fuelChargePercent"
            rules={vendorValidator.fuelChargePercent}
          >
            <InputNumber min={0} autoFocus disabled={isEditingVendor} />
          </Form.Item>

          {authorizeHelper.canRenderWithRole(
            [Role.ADMIN, Role.ACCOUNTANT],
            <Form.Item
              label="Phí khác (USD)"
              name="otherFeeInUsd"
              rules={vendorValidator.otherFeeInUsd}
            >
              <InputNumber precision={2} min={0} disabled={isEditingVendor} />
            </Form.Item>,
          )}

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
        <ZoneCreateOrEdit
          isFetchingZones={isFetchingZones}
          zones={zones}
          onRenderZoneName={onRenderZoneName}
          validator={zoneValidator}
          onSubmitZone={onSubmitZone}
          onUpdateZone={onUpdateZone}
          isSubmittingZone={isSubmittingZone}
          editingZone={editingZone}
          onDisposeModal={onDisposeCreationModal}
          onDeleteZone={onDeleteZone}
          onRefresh={onDisposeCreationModal}
          extendActions={[
            <Tooltip title="Chỉ định dịch vụ" key={2}>
              <Button
                icon={<DeploymentUnitOutlined />}
                type="primary"
                shape="circle"
                size="small"
                onClick={onVisibleServiceSelectionModal}
              />
            </Tooltip>,
          ]}
          note="Không sửa, xóa được trên các Zone của Dịch Vụ tại đây. Nếu có nhu cầu này, click vào Tên Zone theo dịch vụ tương ứng, dữ liệu tại đây sẽ tự động được cập nhật theo."
          isVendorZone
        />
        <ServiceSelectionModal
          visible={visibleServiceSelectionModal}
          services={parcelServices}
          isFetching={isFetchingServices}
          onClose={onCloseServiceSelectionModal}
          assignedServiceIds={assignedParcelServices}
          isFetchingAssignedServiceIds={isFetchingAssignedServices}
          isSubmitting={isSubmittingSelectedServices}
          onSubmit={onSubmitServiceAssignments}
        />
      </ContentContainer>
    </RootContainer>
  );
});
