import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export const showConfirm = (message: string, onOk?, onCancel?) => {
  Modal.confirm({
    title: 'Xác Nhận',
    icon: <ExclamationCircleOutlined />,
    content: message,
    okText: 'Ok',
    cancelText: 'Hủy',
    onOk,
    onCancel,
  });
};
