/**
 *
 * UserProfile
 *
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { selectIsChangingPass, selectPassChangingError } from './selectors';
import { userProfileSaga } from './saga';
import { RootContainer, ContentContainer } from 'app/components/Layout';
import { Form, Button, Alert } from 'antd';
import { PasswordInput } from 'app/components/Input';
import isEmpty from 'lodash/fp/isEmpty';

interface Props {}

export const UserProfile = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: userProfileSaga });
  const dispatch = useDispatch();
  const [passChangingForm] = Form.useForm();

  const isChangingPass = useSelector(selectIsChangingPass);
  const passChangingError = useSelector(selectPassChangingError);

  useEffect(() => {
    return function cleanUp() {
      dispatch(actions.reset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validator = useMemo(
    () => ({
      oldPass: [{ required: true, message: 'Chưa nhập mật khẩu hiện tại' }],
      newPass: [
        { required: true, message: 'Chưa nhập mật khẩu mới' },
        ({ getFieldValue }) => ({
          validator(_rule, value) {
            if (!value || getFieldValue('oldPass') === value) {
              return Promise.reject(
                'Mật khẩu mới phải khác mật khẩu hiện tại!',
              );
            }
            return Promise.resolve();
          },
        }),
      ],
      confirmNewPass: [
        { required: true, message: 'Chưa nhập xác nhận mật khẩu mới' },
        ({ getFieldValue }) => ({
          validator(_rule, value) {
            if (!value || getFieldValue('newPass') === value) {
              return Promise.resolve();
            }
            return Promise.reject('Xác nhận mật khẩu mới không đúng!');
          },
        }),
      ],
    }),
    [],
  );

  const onChangePass = useCallback(
    form => {
      const { newPass } = form;
      dispatch(
        actions.changePass({
          newPass,
          onSuccess: () => {
            passChangingForm.resetFields();
          },
        }),
      );
    },
    [dispatch, passChangingForm],
  );

  return (
    <RootContainer title="Đổi mật khẩu">
      <ContentContainer>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 10 }}
          onFinish={onChangePass}
          form={passChangingForm}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="oldPass"
            rules={validator.oldPass}
          >
            <PasswordInput
              disabled={isChangingPass}
              ref={(ref: any) => ref?.select()}
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPass"
            rules={validator.newPass}
          >
            <PasswordInput disabled={isChangingPass} />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmNewPass"
            rules={validator.confirmNewPass}
          >
            <PasswordInput disabled={isChangingPass} />
          </Form.Item>
          {!isEmpty(passChangingError) && (
            <Form.Item label=" " colon={false}>
              <Alert type="error" message={passChangingError} showIcon />
            </Form.Item>
          )}
          <Form.Item label=" " colon={false}>
            <Button type="primary" htmlType="submit" loading={isChangingPass}>
              LƯU
            </Button>
          </Form.Item>
        </Form>
      </ContentContainer>
    </RootContainer>
  );
});
