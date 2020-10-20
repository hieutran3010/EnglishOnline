import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import BillList from 'app/containers/BillAndWorkspace/components/BillList';
import { BILL_LIST_DEFAULT_ORDER } from 'app/containers/BillAndWorkspace/constants';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';

const { Title } = Typography;

interface Props {
  visible?: boolean;
  onClose?: () => void;
  vendorId?: string;
  vendorName?: string;
}
const VendorDeletion = memo(
  ({ visible, onClose, vendorId, vendorName }: Props) => {
    const [totalBills, setTotalBills] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [isLoadingTotalCount, setIsLoadingTotalCount] = useState(false);

    useLayoutEffect(() => {
      setTimeout(() => {
        billDataSource.onReloadData();
      }, 300);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendorId]);

    const renderActions = useCallback(() => {
      if (isChecking) {
        return <></>;
      }

      return (
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          {totalBills > 0 ? (
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
    }, [totalBills, isChecking]);

    const billDataSource = useMemo(() => {
      const billDataSource = getDataSource(FETCHER_KEY.BILL);
      billDataSource.orderByFields = BILL_LIST_DEFAULT_ORDER;
      billDataSource.query = `VendorId = "${vendorId}"`;

      return billDataSource;
    }, [vendorId]);

    const onBillsLoading = useCallback((isLoading: boolean) => {
      setIsChecking(isLoading);
    }, []);

    const onTotalBillChanged = useCallback((totalBill: number) => {
      setTotalBills(totalBill);
    }, []);

    const onLoadingTotalCount = useCallback((isLoading: boolean) => {
      setIsLoadingTotalCount(isLoading);
    }, []);

    return (
      <Modal visible={visible} onCancel={onClose} width="100%" footer={false}>
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Title level={4}>
            {isLoadingTotalCount
              ? `Đang kiểm tra bill liên quan tới NCC ${vendorName}...`
              : totalBills > 0
              ? `Có ${totalBills} bill liên quan tới NCC ${vendorName}. Vui lòng chọn các lựa chọn bên dưới để tiếp tục.`
              : `Không có bill nào liên quan tới NCC ${vendorName}. Bấm XÁC NHẬN XÓA để tiếp tục`}
          </Title>
        </Space>
        {renderActions()}
        <BillList
          billDataSource={billDataSource}
          onLoading={onBillsLoading}
          onTotalCountChanged={onTotalBillChanged}
          onLoadingTotalCount={onLoadingTotalCount}
          hideActions
          excludeFields={[
            'billDeliveryHistories',
            'licenseUserId',
            'vendorName',
          ]}
        />
      </Modal>
    );
  },
);

export default VendorDeletion;
