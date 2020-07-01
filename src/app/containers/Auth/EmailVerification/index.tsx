/**
 *
 * EmailVerification
 *
 */

import React, { memo, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { Result, Button, Space } from 'antd';
import { useHistory } from 'react-router-dom';

import { authService, authStorage } from 'app/services/auth';

export const EmailVerification = memo(() => {
  const history = useHistory();
  const [isSending, setIsSending] = useState(false);

  const onSendEmailVerification = useCallback(async () => {
    setIsSending(true);
    await authService.sendEmailVerification();
    setIsSending(false);
    toast.success(
      'Một email đã được gởi tới bạn cho việc xác minh, vui lòng kiểm tra mail!',
    );
    authService.logout();
    history.push('/');
  }, [history]);

  const onConfirmed = useCallback(async () => {
    await authService.logout();
    history.push('/');
  }, [history]);

  const user = authStorage.getUser();

  return (
    <Result
      status="403"
      title="403"
      subTitle={`Bạn chưa xác thực cho email ${user.email}. Vui lòng kiểm tra mail và xác thực!`}
      extra={
        <Space>
          <Button
            type="primary"
            onClick={onSendEmailVerification}
            loading={isSending}
          >
            Gởi email xác thực
          </Button>
          <Button onClick={onConfirmed} disabled={isSending}>
            Tôi đã xác thực
          </Button>
        </Space>
      }
    />
  );
});
