/**
 *
 * VendorCreation
 *
 */

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Button, Checkbox, Form, Space } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import isEmpty from 'lodash/fp/isEmpty';
import capitalize from 'lodash/fp/capitalize';
import { Store } from 'antd/lib/form/interface';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import getVendorValidator from 'app/models/validators/vendorValidator';

import { reducer, sliceKey, actions } from './slice';
import { selectIsSubmittingVendor, selectVendor } from './selectors';
import { vendorCreationSaga } from './saga';
import trim from 'lodash/fp/trim';

export const VendorCreation = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: vendorCreationSaga });

  const isSubmitting = useSelector(selectIsSubmittingVendor);
  const vendor = useSelector(selectVendor);

  const history = useHistory();
  const [vendorForm] = Form.useForm();
  const { vendorId } = useParams() as any;
  const dispatch = useDispatch();

  const isEditMode = useMemo(() => vendorId && !isEmpty(vendorId), [vendorId]);

  useEffect(() => {
    if (isEditMode === true) {
      dispatch(actions.fetchingVendor(vendorId));
    }
  }, [dispatch, isEditMode, vendorId]);

  useEffect(() => {
    if (isEditMode === true && vendor) {
      vendorForm.setFieldsValue(vendor as Store);
    }
  }, [isEditMode, vendor, vendorForm]);

  const onBack = useCallback(() => {
    history.goBack();
  }, [history]);

  const onSave = useCallback(
    vendor => {
      vendor.officeAddress = capitalize(vendor.officeAddress);
      vendor.name = trim(vendor.name);
      if (isEditMode === true) {
        dispatch(actions.updateVendor(vendor));
      } else {
        dispatch(actions.submitVendor({ vendor, history }));
      }
    },
    [dispatch, history, isEditMode],
  );

  const onNavigateToFeeAndZone = useCallback(async () => {
    history.push(`/vendorQuotation/${vendorId}`);
  }, [history, vendorId]);

  const componentModeParams = useMemo(() => {
    if (isEditMode === true) {
      return {
        title: 'Cập nhật thông tin Nhà cung cấp',
        subTitle: '',
        actions: [
          <Button key="1" type="primary" onClick={onNavigateToFeeAndZone}>
            Phí & Zone
          </Button>,
        ],
      };
    }
    return {
      title: 'Thêm nhà cung cấp',
      subTitle:
        'Sau bước này, bạn sẽ được chuyển tới trang để nhập các loại Phí, Zone và Báo giá',
      actions: [],
    };
  }, [isEditMode, onNavigateToFeeAndZone]);

  const vendorValidator = useMemo(() => getVendorValidator(vendorId), [
    vendorId,
  ]);

  return (
    <RootContainer
      title={componentModeParams.title}
      subTitle={componentModeParams.subTitle}
      canBack
      rightComponents={componentModeParams.actions}
    >
      <ContentContainer>
        <Form layout="vertical" form={vendorForm} onFinish={onSave}>
          <Form.Item
            label="Tên nhà cung cấp"
            name="name"
            rules={vendorValidator.name}
          >
            <Input ref={ref => ref?.select()} />
          </Form.Item>

          <Form.Item label="Địa chỉ văn phòng" name="officeAddress">
            <Input
              disabled={isSubmitting}
              style={{ textTransform: 'capitalize' }}
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại liên lạc"
            name="phone"
            rules={vendorValidator.phone}
          >
            <Input disabled={isSubmitting} />
          </Form.Item>

          <Form.Item
            name="isStopped"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox disabled={isSubmitting}>Ngừng hợp tác?</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Lưu
              </Button>
              <Button
                onClick={onBack}
                htmlType="button"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </ContentContainer>
    </RootContainer>
  );
});
