import React, { memo, useCallback } from 'react';
import { Button, Space, Typography } from 'antd';
import Icon, { CopyrightOutlined, CopyOutlined } from '@ant-design/icons';
import useCopyClipboard from 'react-use-clipboard';
import { toast } from 'react-toastify';
const { Text } = Typography;

const PlaneSvg = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 512 512"
    style={{ marginBottom: 3 }}
  >
    <g>
      <path d="m481.34 88.483c-19.196-11.863-42.709-12.919-62.897-2.826l-81.889 40.943-226.135-120.608c-22.938-12.22-53.926-6.073-65.308 21.421-6.92 16.686-3.136 35.724 9.643 48.503l127.722 127.722-98.074 49.038-24.788-37.182c-2.782-4.173-7.466-6.68-12.481-6.68h-32.133c-8.284 0-15 6.716-15 15v59.752c0 30.477 15.476 58.238 41.405 74.267 41.786 25.804 80.512 6.029 84.938 3.818l362.993-181.505c3.193-1.596 22.664-11.929 22.664-36.672 0-22.569-11.462-43.126-30.66-54.991zm-405.372-33.78c-4.164-4.164-5.398-10.364-3.142-15.806 3.695-8.926 14.164-11.395 23.481-6.432l207.345 110.586-92.891 46.445zm399.951 98.612-362.989 181.502c-17.895 8.94-38.74 8.001-55.757-2.506-17.015-10.518-27.173-28.741-27.173-48.745v-44.752h9.105l27.68 41.521c4.196 6.296 12.424 8.478 19.189 5.096l345.883-172.94c10.822-5.41 23.424-4.845 33.71 1.512 10.137 6.263 16.433 17.556 16.433 29.471 0 .429.116 6.741-6.081 9.841z" />
      <path d="m497 482h-482c-8.284 0-15 6.716-15 15s6.716 15 15 15h482c8.284 0 15-6.716 15-15s-6.716-15-15-15z" />
    </g>
  </svg>
);
const PlaneIcon = props => <Icon component={PlaneSvg} {...props} />;

interface Props {
  airlineBillId?: string;
  childBillId?: string;
}
const BillTrackingId = ({ airlineBillId, childBillId }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [copied, setIsCopied] = useCopyClipboard(
    airlineBillId || childBillId || '',
  );

  const onCopy = useCallback(() => {
    setIsCopied();
    toast.success(`Đã copy ${airlineBillId || childBillId}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airlineBillId, childBillId]);

  if (!airlineBillId && !childBillId) {
    return <Text strong>{'<Chưa có tracking>'}</Text>;
  }

  return (
    <Space size="small">
      <Text strong>{airlineBillId || childBillId}</Text>
      {airlineBillId ? (
        <PlaneIcon style={{ fontSize: '0.8rem' }} />
      ) : (
        <CopyrightOutlined style={{ marginBottom: 7, fontSize: '0.8rem' }} />
      )}
      <Button
        shape="circle"
        type="primary"
        icon={<CopyOutlined />}
        size="small"
        ghost
        onClick={onCopy}
      />
    </Space>
  );
};

export default memo(BillTrackingId);
