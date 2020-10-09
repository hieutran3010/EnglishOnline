/**
 *
 * CustomerCreateOrUpdatePage
 *
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Space, Button } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import toUpper from 'lodash/fp/toUpper';
import isEmpty from 'lodash/fp/isEmpty';
import { Store } from 'antd/lib/form/interface';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import getCustomerValidator from 'app/models/validators/customerValidator';

import { actions, reducer, sliceKey } from './slice';
import {
  selectIsSubmitting,
  selectIsFetchingCustomer,
  selectCustomer,
} from './selectors';
import { customerCreateOrUpdatePageSaga } from './saga';
import { authStorage } from 'app/services/auth';
import { formatPhoneNumber } from 'utils/numberFormat';
import { trimStart } from 'lodash';
import trim from 'lodash/fp/trim';

export const CustomerCreateOrUpdatePage = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: customerCreateOrUpdatePageSaga });

  const user = authStorage.getUser();

  const history = useHistory();
  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const { customerId } = useParams() as any;

  const isSubmitting = useSelector(selectIsSubmitting);
  const isFetchingCustomer = useSelector(selectIsFetchingCustomer);
  const customer = useSelector(selectCustomer);

  const customerValidator = useMemo(() => getCustomerValidator(customerId), [
    customerId,
  ]);
  const isEditMode = customerId && !isEmpty(customerId);

  useEffect(() => {
    if (isEditMode) {
      dispatch(actions.fetchCustomer(customerId));
    }
  }, [customerId, dispatch, isEditMode]);

  useEffect(() => {
    if (isEditMode && customer && !isEmpty(customer)) {
      customerForm.setFieldsValue(customer as Store);
    }
  }, [customer, customerForm, customerId, isEditMode, user.id, user.role]);

  const onBack = useCallback(() => {
    history.push('/customers');
  }, [history]);

  const onSubmitCustomer = useCallback(
    customer => {
      customer.code = toUpper(customer.code);
      customer.name = trim(customer.name);
      customer.phone = trim(customer.phone);

      if (isEditMode) {
        dispatch(actions.updateCustomer(customer));
      } else {
        dispatch(actions.submitCustomer({ history, customer }));
      }
    },
    [dispatch, history, isEditMode],
  );

  const onCreateNew = useCallback(() => {
    history.push('/customerCreation');
  }, [history]);

  const onNormalizePhoneNumber = useCallback(
    (value, _prevValue, _prevValues) => {
      return formatPhoneNumber(value);
    },
    [],
  );

  const onNormalizeNameAndAddress = useCallback(
    (value, _prevValue, _prevValues) => {
      const formatted = trimStart(value, '- ');
      return formatted;
    },
    [],
  );

  const title = isEditMode ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới';

  return (
    <>
      <RootContainer title={title} onBack={onBack}>
        <ContentContainer loading={isFetchingCustomer}>
          <Form
            form={customerForm}
            layout="vertical"
            onFinish={onSubmitCustomer}
          >
            <Form.Item label="Mã KH" name="code" rules={customerValidator.code}>
              <Input
                ref={ref => ref?.select()}
                style={{ textTransform: 'uppercase' }}
                disabled={isSubmitting}
              />
            </Form.Item>
            <Form.Item
              label="Tên KH"
              name="name"
              rules={customerValidator.name}
              normalize={onNormalizeNameAndAddress}
            >
              <Input disabled={isSubmitting} />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={customerValidator.phone}
              normalize={onNormalizePhoneNumber}
            >
              <Input disabled={isSubmitting} />
            </Form.Item>
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={customerValidator.address}
              normalize={onNormalizeNameAndAddress}
            >
              <Input disabled={isSubmitting} />
            </Form.Item>
            <Form.Item label="Thông tin gợi nhớ" name="hint">
              <Input />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  Lưu
                </Button>
                {isEditMode && (
                  <Button
                    type="ghost"
                    htmlType="button"
                    disabled={isSubmitting}
                    onClick={onCreateNew}
                  >
                    Thêm mới
                  </Button>
                )}
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
    </>
  );
});
