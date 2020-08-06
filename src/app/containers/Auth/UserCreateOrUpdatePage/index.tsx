/**
 *
 * UserCreateOrUpdatePage
 *
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Space, Alert, Checkbox } from 'antd';
import isEmpty from 'lodash/fp/isEmpty';
import isArray from 'lodash/fp/isArray';
import { useParams } from 'react-router-dom';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import { PasswordInput } from 'app/components/Input';
import getUserValidator from 'app/models/validators/userValidator';

import { actions, reducer, sliceKey } from './slice';
import {
  selectError,
  selectIsSubmitting,
  selectIsFetchingUser,
  selectUser,
} from './selectors';
import { userCreateOrUpdatePageSaga } from './saga';
import RoleSelection from '../components/RoleSelection';

export const UserCreateOrUpdatePage = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: userCreateOrUpdatePageSaga });

  const dispatch = useDispatch();
  const [userForm] = Form.useForm();
  const { userId } = useParams();
  const isEditing = !isEmpty(userId);

  const error = useSelector(selectError);
  const isSubmitting = useSelector(selectIsSubmitting);
  const isFetchingUser = useSelector(selectIsFetchingUser);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (isEditing) {
      dispatch(actions.fetchUser(userId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isEditing && !isEmpty(user.id)) {
      userForm.setFieldsValue(user);
    }
  }, [isEditing, user, userForm]);

  const onSubmit = useCallback(
    form => {
      if (!isArray(form.roles)) {
        form.roles = [form.roles];
      }

      if (!isEditing) {
        dispatch(actions.createUser(form));
      } else {
        form.id = userId;
        dispatch(actions.updateUser(form));
      }
    },
    [dispatch, isEditing, userId],
  );

  const userValidator = useMemo(() => getUserValidator(), []);

  const title = isEditing ? 'Cập nhật người dùng' : 'Thêm người dùng mới';

  return (
    <RootContainer title={title} subTitle={user.email} canBack>
      <ContentContainer loading={isFetchingUser}>
        <Form
          form={userForm}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{ role: 'license' }}
        >
          {!isEditing && (
            <Form.Item name="email" label="Email" rules={userValidator.email}>
              <Input disabled={isSubmitting} ref={ref => ref?.select()} />
            </Form.Item>
          )}
          {!isEditing && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={userValidator.password}
            >
              <PasswordInput disabled={isSubmitting} />
            </Form.Item>
          )}
          <Form.Item name="displayName" label="Tên" rules={userValidator.name}>
            <Input disabled={isSubmitting} />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={userValidator.phoneNumber}
          >
            <Input disabled={isSubmitting} />
          </Form.Item>
          <Form.Item name="roles" label="Quyền" rules={userValidator.role}>
            <RoleSelection disabled={isSubmitting} />
          </Form.Item>
          {isEditing && (
            <Form.Item
              name="disabled"
              label="Khóa Tài Khoản?"
              valuePropName="checked"
            >
              <Checkbox disabled={isSubmitting} />
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Lưu
              </Button>
              {error && !isEmpty(error) && (
                <Alert type="error" message={error} showIcon />
              )}
            </Space>
          </Form.Item>
        </Form>
      </ContentContainer>
    </RootContainer>
  );
});
