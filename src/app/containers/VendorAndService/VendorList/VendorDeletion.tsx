import React, { memo, useCallback, useMemo } from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import Bill from 'app/models/bill';

const { Title } = Typography;

interface Props {
  onCheckingAssociatedBills?: () => void;
  isChecking?: boolean;
  visible?: boolean;
  associatedBills?: Bill[];
  totalBills?: number;
  onClose?: () => void;
}
const VendorDeletion = memo(
  ({
    onCheckingAssociatedBills,
    visible,
    associatedBills,
    totalBills,
    isChecking,
    onClose,
  }: Props) => {
    const hasAssociatedBills = totalBills && totalBills > 0;

    const renderActions = useCallback(() => {
      if (isChecking) {
        return <></>;
      }

      return (
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          {hasAssociatedBills ? (
            <>
              <Button type="primary" danger ghost>
                Xóa NCC và các Bill liên quan
              </Button>
              <Button type="primary" danger>
                Chỉ xóa NCC
              </Button>
            </>
          ) : (
            <Button type="primary" danger>
              XÁC NHẬN XÓA
            </Button>
          )}
        </Space>
      );
    }, [hasAssociatedBills, isChecking]);

    return (
      <Modal visible={visible} onCancel={onClose} width="100%" footer={false}>
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Title level={4}>
            {isChecking
              ? 'Đang kiểm tra bill liên quan tới NCC này...'
              : hasAssociatedBills
              ? `Có ${totalBills} bill liên quan tới NCC này. Vui lòng chọn các lựa chọn bên dưới để tiếp tục.`
              : 'Không có bill nào liên quan tới NCC này. Bấm XÁC NHẬN XÓA để tiếp tục'}
          </Title>
        </Space>
        {renderActions()}
      </Modal>
    );
  },
);

export default VendorDeletion;
