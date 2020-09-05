/**
 *
 * ServiceCreateOrUpdate
 *
 */

import React, { memo, useEffect, useCallback, useMemo, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import qs from 'qs';
import find from 'lodash/fp/find';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import getParcelServiceValidator from 'app/models/validators/parcelServiceValidator';
import getParcelServiceZoneValidator from 'app/models/validators/parcelServiceZoneValidator';

import ZoneCreateOrEdit from '../components/ZoneCreateOrEdit';

import {
  selectZones,
  selectIsFetchingZones,
  selectParcelService,
  selectIsSubmittingZone,
  selectEditingZone,
} from './selectors';
import { reducer, actions, sliceKey } from './slice';
import { serviceCreateOrUpdateSaga } from './saga';
import { ParcelServiceZone } from 'app/models/parcelService';

export const ServiceCreateOrUpdate = memo(() => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: serviceCreateOrUpdateSaga });

  const dispatch = useDispatch();
  const [serviceForm] = Form.useForm();
  const { serviceId } = useParams();
  const { search } = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (serviceId) {
      dispatch(actions.fetchParcelService(serviceId));
      dispatch(actions.fetchZones(serviceId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const zones = useSelector(selectZones);
  const isFetchingZones = useSelector(selectIsFetchingZones);
  const parcelService = useSelector(selectParcelService);
  const isSubmittingZone = useSelector(selectIsSubmittingZone);
  const editingZone = useSelector(selectEditingZone);

  const [autoLoadedZoneName, setAutoLoadedZoneName] = useState<string>();

  useEffect(() => {
    if (parcelService) {
      serviceForm.setFieldsValue(parcelService);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcelService]);

  useEffect(() => {
    const { zoneName } = qs.parse(search, { ignoreQueryPrefix: true });

    if (zoneName && zoneName !== autoLoadedZoneName) {
      const zone = find((z: ParcelServiceZone) => z.name === zoneName)(zones);
      if (zone) {
        dispatch(actions.setEditingZone(zone));
        setAutoLoadedZoneName(zoneName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, zones]);

  useEffect(() => {
    return function cleanUp() {
      dispatch(actions.resetState());
    };
  }, [dispatch]);

  const onSubmitService = useCallback(
    form => {
      if (serviceId) {
        dispatch(actions.updateService(form));
      } else {
        dispatch(actions.createNewService({ serviceData: form, history }));
      }
    },
    [dispatch, history, serviceId],
  );

  const onSubmitZone = useCallback(
    (zone: ParcelServiceZone | any) => {
      dispatch(actions.addOrUpdateZone(zone));
    },
    [dispatch],
  );

  const onUpdateZone = useCallback(
    (zone: ParcelServiceZone | any) => {
      dispatch(actions.setEditingZone(zone));
    },
    [dispatch],
  );

  const onDisposeCreationModal = useCallback(() => {
    dispatch(actions.setEditingZone(undefined));
  }, [dispatch]);

  const onDeleteZone = useCallback(
    (zone: ParcelServiceZone | any) => {
      dispatch(actions.deleteZone(zone));
    },
    [dispatch],
  );

  const parcelServiceValidator = useMemo(
    () => getParcelServiceValidator(serviceId),
    [serviceId],
  );

  const parcelServiceZoneValidator = useMemo(
    () => getParcelServiceZoneValidator(serviceId, editingZone?.id),
    [editingZone, serviceId],
  );

  const title = serviceId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới';

  return (
    <RootContainer
      title={title}
      subTitle={parcelService ? parcelService.name : ''}
      canBack
    >
      <ContentContainer>
        {(!serviceId || (parcelService && !parcelService.isSystem)) && (
          <Form
            form={serviceForm}
            size="small"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            onFinish={onSubmitService}
          >
            <Form.Item
              label="Tên dịch vụ"
              name="name"
              rules={parcelServiceValidator.name}
            >
              <Input ref={ref => ref?.select()} disabled={isFetchingZones} />
            </Form.Item>
            <Form.Item label=" " colon={false}>
              <Button
                htmlType="submit"
                type="primary"
                loading={isFetchingZones}
              >
                Lưu
              </Button>
            </Form.Item>
          </Form>
        )}
        {serviceId && (
          <ZoneCreateOrEdit
            isFetchingZones={isFetchingZones}
            zones={zones}
            validator={parcelServiceZoneValidator}
            onSubmitZone={onSubmitZone}
            onUpdateZone={onUpdateZone}
            isSubmittingZone={isSubmittingZone}
            editingZone={editingZone}
            onDisposeModal={onDisposeCreationModal}
            onDeleteZone={onDeleteZone}
            onRefresh={onDisposeCreationModal}
            note={
              'Zone sau khi cập nhật sẽ được tự động áp dụng cho tất cả NCC đang sử dụng nó'
            }
          />
        )}
      </ContentContainer>
    </RootContainer>
  );
});
