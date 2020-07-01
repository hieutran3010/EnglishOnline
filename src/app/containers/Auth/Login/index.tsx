/**
 *
 * Login
 *
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { actions, reducer, sliceKey } from './slice';
import {
  selectIsBeingLogin,
  selectError,
  selectRecoveryError,
} from './selectors';
import { loginSaga } from './saga';
import {
  StyledLogInContainer,
  StyledLoginFormContainer,
} from './styles/StyledIndex';
import { isEmpty } from 'lodash/fp';
import { getLoginValidator } from 'app/models/validators/userValidator';
import { toast } from 'react-toastify';

const logo = require('assets/logo.png');

enum AuthenticationMode {
  Login = 0,
  RecoverPass,
}

export const Login = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: loginSaga });

  const isBeingLogin = useSelector(selectIsBeingLogin);
  const error = useSelector(selectError);
  const recoveryError = useSelector(selectRecoveryError);

  const [authMode, setAuthMode] = useState<AuthenticationMode>(
    AuthenticationMode.Login,
  );

  const dispatch = useDispatch();

  const onFinish = useCallback(
    form => {
      dispatch(actions.login(form));
    },
    [dispatch],
  );

  const onRecoverPass = useCallback(() => {
    setAuthMode(AuthenticationMode.RecoverPass);
  }, []);

  const onBackToLogin = useCallback(() => {
    setAuthMode(AuthenticationMode.Login);
  }, []);

  const onSendRecoveryEmail = useCallback(
    form => {
      const { email } = form;
      dispatch(
        actions.recoveryPassword({
          email,
          onSent: () => {
            toast.success(
              'Đã gởi email! Vui lòng check mail để tiếp tục khôi phục mật khẩu!',
            );
            setAuthMode(AuthenticationMode.Login);
          },
        }),
      );
    },
    [dispatch],
  );

  const loginValidator = useMemo(() => getLoginValidator(), []);

  return (
    <StyledLogInContainer>
      <StyledLoginFormContainer>
        <img src={logo} height="40px" alt="" style={{ marginBottom: 24 }} />
        {authMode === AuthenticationMode.Login && (
          <Form name="normal_login" className="login-form" onFinish={onFinish}>
            <Form.Item name="email" rules={loginValidator.email}>
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email"
                ref={ref => ref?.select()}
                disabled={isBeingLogin}
              />
            </Form.Item>
            <Form.Item name="password" rules={loginValidator.password}>
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Mật khẩu"
                disabled={isBeingLogin}
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="login-form-forgot"
                type="link"
                disabled={isBeingLogin}
                onClick={onRecoverPass}
              >
                Quên mật khẩu?
              </Button>
            </Form.Item>

            <Form.Item>
              {error && !isEmpty(error) && (
                <Alert
                  type="error"
                  message={error}
                  showIcon
                  style={{ marginBottom: 10 }}
                />
              )}
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={isBeingLogin}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>
        )}
        {authMode === AuthenticationMode.RecoverPass && (
          <Form onFinish={onSendRecoveryEmail}>
            <Form.Item name="email" rules={loginValidator.email}>
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Nhập email của bạn"
                ref={ref => ref?.select()}
                disabled={isBeingLogin}
              />
            </Form.Item>
            {recoveryError && !isEmpty(recoveryError) && (
              <Form.Item>
                <Alert type="error" message={recoveryError} showIcon />
              </Form.Item>
            )}
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  Gởi email phục hồi mật khẩu
                </Button>
                <Button htmlType="button" onClick={onBackToLogin}>
                  Đăng Nhập
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </StyledLoginFormContainer>
    </StyledLogInContainer>
  );
});
