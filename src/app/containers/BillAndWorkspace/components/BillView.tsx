import React, { memo, useState, useCallback, useMemo } from 'react';
import moment from 'moment';
import {
  Divider,
  Typography,
  Descriptions,
  Button,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import isUndefined from 'lodash/fp/isUndefined';
import isNil from 'lodash/fp/isNil';

import Bill, { BILL_STATUS, PAYMENT_TYPE } from 'app/models/bill';
import { toCurrency } from 'utils/numberFormat';
import { authorizeHelper } from 'app/services/auth';
import { Role } from 'app/models/user';

import BillStatusTag from './BillStatusTag';
import {
  StyledDateAndAssigneeContainer,
  StyledCustomerContainer,
  StyledSenderContainer,
  StyledReceiverContainer,
} from '../Workspace/styles/StyledIndex';
import PurchasePrice from './PurchasePrice';
import UserAvatar from 'app/containers/Auth/components/UserAvatar';
import { showConfirm } from 'app/components/Modal/utils';

const { Title, Text } = Typography;

const getPaymentDisplay = (paymentType: PAYMENT_TYPE | undefined) => {
  if (paymentType === PAYMENT_TYPE.CASH) {
    return 'Tiền mặt';
  }

  return 'Chuyển khoản';
};

interface Props {
  bill: Bill;
  onArchiveBill?: (bill: Bill) => () => void;
  onPrintedVat?: (bill: Bill) => void;
  onRestoreArchivedBill?: (billId: string) => void;
  onReturnFinalBillToAccountant?: (billId: string) => void;
  onForceDeleteBill?: (billId: string) => void;
}
const BillView = ({
  bill,
  onArchiveBill,
  onPrintedVat,
  onRestoreArchivedBill,
  onReturnFinalBillToAccountant,
  onForceDeleteBill,
}: Props) => {
  const [isRequestedPrinted, setIsRequestedPrinted] = useState(false);

  const onRequestPrintedVat = useCallback(() => {
    if (onPrintedVat) {
      onPrintedVat(bill);
      setIsRequestedPrinted(true);
    }
  }, [bill, onPrintedVat]);

  const purchasePriceInfo = useMemo(() => {
    return new Bill(bill).getPurchasePriceInfo();
  }, [bill]);

  const _onRestoreArchivedBill = useCallback(() => {
    if (onRestoreArchivedBill) {
      onRestoreArchivedBill(bill.id);
    }
  }, [bill.id, onRestoreArchivedBill]);

  const _onReturnFinalBillToAccountant = useCallback(() => {
    if (onReturnFinalBillToAccountant) {
      onReturnFinalBillToAccountant(bill.id);
    }
  }, [bill.id, onReturnFinalBillToAccountant]);

  const _onForceDeleteBill = useCallback(() => {
    if (onForceDeleteBill) {
      showConfirm(
        `Bạn có chắc muốn xóa bill này, bill sau khi xóa không thể phục hồi, tiếp tục xóa?`,
        () => {
          onForceDeleteBill(bill.id);
        },
      );
    }
  }, [bill.id, onForceDeleteBill]);

  return (
    <>
      <StyledDateAndAssigneeContainer>
        <Space>
          {onForceDeleteBill &&
            authorizeHelper.canRenderWithRole(
              [Role.ADMIN],
              <Button
                type="primary"
                danger
                size="small"
                onClick={_onForceDeleteBill}
              >
                Xóa Bill
              </Button>,
            )}
          {bill.status === BILL_STATUS.DONE &&
            !bill.isArchived &&
            onArchiveBill &&
            authorizeHelper.canRenderWithRole(
              [Role.ACCOUNTANT, Role.ADMIN],
              <Button danger onClick={onArchiveBill(bill)} size="small">
                Hủy bill
              </Button>,
            )}
          {onRestoreArchivedBill &&
            bill.isArchived &&
            authorizeHelper.canRenderWithRole(
              [Role.ADMIN],
              <Button danger size="small" onClick={_onRestoreArchivedBill}>
                Bỏ Hủy bill
              </Button>,
            )}

          {onReturnFinalBillToAccountant &&
            !bill.isArchived &&
            bill.status === BILL_STATUS.DONE &&
            authorizeHelper.canRenderWithRole(
              [Role.ADMIN],
              <Button
                type="primary"
                ghost
                size="small"
                onClick={_onReturnFinalBillToAccountant}
              >
                Trả lại Kế Toán
              </Button>,
            )}
          <span>{moment(bill.date).format('DD-MM-YYYY')}</span>
        </Space>

        <div>
          <BillStatusTag status={bill.status} />
          {bill.isArchived && <Tag color="red">Đã Bị Hủy</Tag>}
          {bill.status === BILL_STATUS.DONE &&
            !bill.isArchived &&
            (bill.vat || 0) > 0 &&
            !bill.isPrintedVatBill &&
            onPrintedVat &&
            !isRequestedPrinted &&
            authorizeHelper.canRenderWithRole(
              [Role.ADMIN, Role.ACCOUNTANT],
              <span>
                Bill có VAT nhưng chưa được đánh dấu, bấm vào
                <Button
                  type="link"
                  style={{ padding: 0, marginRight: 2, marginLeft: 2 }}
                  onClick={onRequestPrintedVat}
                >
                  đây
                </Button>
                để đánh dấu đã xuất bill VAT!
              </span>,
            )}
          {bill.isPrintedVatBill && <Tag color="red">Đã xuất bill VAT</Tag>}
        </div>

        <Space>
          {bill.saleUserId && (
            <UserAvatar title="Sale" userId={bill.saleUserId} />
          )}
          {bill.licenseUserId && (
            <UserAvatar title="Chứng Từ" userId={bill.licenseUserId} />
          )}
          {bill.accountantUserId && (
            <UserAvatar title="Kế Toán" userId={bill.accountantUserId} />
          )}
        </Space>
      </StyledDateAndAssigneeContainer>

      <Divider
        type="horizontal"
        orientation="center"
        style={{ margin: '17px 0' }}
      />

      <StyledCustomerContainer style={{ marginBottom: 20 }}>
        <StyledSenderContainer>
          <Title level={4} type="secondary">
            Khách gởi
          </Title>
          <Descriptions size="small" bordered layout="horizontal" column={1}>
            <Descriptions.Item label="Tên">
              {bill.senderName}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Số ĐT">
              {bill.senderPhone}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {bill.senderAddress}&nbsp;
            </Descriptions.Item>
          </Descriptions>
        </StyledSenderContainer>
        <div style={{ width: 20 }} />
        <StyledReceiverContainer>
          <Title level={4} type="secondary">
            Khách nhận
          </Title>
          <Descriptions size="small" bordered layout="horizontal" column={1}>
            <Descriptions.Item label="Tên">
              {bill.receiverName}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Số ĐT">
              {bill.receiverPhone}&nbsp;
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {bill.receiverAddress}&nbsp;
            </Descriptions.Item>
          </Descriptions>
        </StyledReceiverContainer>
      </StyledCustomerContainer>

      <div style={{ marginBottom: 20 }}>
        <Title level={4} type="secondary">
          Thông tin hàng
        </Title>
        <Descriptions size="small" bordered column={1}>
          <Descriptions.Item label="Bill hãng bay">
            {bill.airlineBillId}
          </Descriptions.Item>
          <Descriptions.Item label="Bill con">
            {bill.childBillId}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp">
            {bill.vendorName}
          </Descriptions.Item>
          <Descriptions.Item label="Loại hàng">
            {bill.description}
          </Descriptions.Item>
          <Descriptions.Item label="Trọng lượng (kg)">
            <Space>
              <Text>{bill.weightInKg}kg</Text>
              {!isUndefined(bill.oldWeightInKg) && !isNil(bill.oldWeightInKg) && (
                <Tooltip title="Ký bán cho khách">
                  <Text delete>{bill.oldWeightInKg}kg</Text>
                </Tooltip>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Dịch vụ">
            {bill.internationalParcelVendor}
          </Descriptions.Item>
          <Descriptions.Item label="Nước đến">
            {bill.destinationCountry}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {authorizeHelper.willRenderIfNot(
        [Role.LICENSE],
        <div style={{ marginBottom: 20 }}>
          <Title level={4} type="secondary">
            Phí & Giá
          </Title>
          <Descriptions size="small" bordered column={1}>
            {authorizeHelper.canRenderWithRole(
              [Role.ACCOUNTANT, Role.ADMIN],
              <Descriptions.Item label="Giá mua">
                <PurchasePrice info={purchasePriceInfo} />
              </Descriptions.Item>,
            )}
            <Descriptions.Item label="Giá bán">
              {toCurrency(bill.salePrice || 0)}
            </Descriptions.Item>
          </Descriptions>
        </div>,
      )}

      {authorizeHelper.willRenderIfNot(
        [Role.LICENSE],
        <StyledCustomerContainer>
          <StyledSenderContainer>
            <Title level={4} type="secondary">
              Khách Hàng Thanh Toán
            </Title>
            <Descriptions size="small" bordered layout="vertical">
              <Descriptions.Item label="Hình thức">
                {getPaymentDisplay(bill.customerPaymentType)}
              </Descriptions.Item>
              <Descriptions.Item label="Đã thanh toán">
                {toCurrency(bill.customerPaymentAmount || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Còn nợ">
                {toCurrency(bill.customerPaymentDebt || 0)}
              </Descriptions.Item>
            </Descriptions>
          </StyledSenderContainer>
          {authorizeHelper.canRenderWithRole(
            [Role.ACCOUNTANT, Role.ADMIN],
            <>
              <div style={{ width: 20 }} />
              <StyledReceiverContainer>
                <Title level={4} type="secondary">
                  Thanh Toán NCC
                </Title>
                <Descriptions size="small" bordered layout="vertical">
                  <Descriptions.Item label="Hình thức">
                    {getPaymentDisplay(bill.vendorPaymentType)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đã thanh toán">
                    {toCurrency(bill.vendorPaymentAmount || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Còn nợ">
                    {toCurrency(bill.vendorPaymentDebt || 0)}
                  </Descriptions.Item>
                </Descriptions>
              </StyledReceiverContainer>
            </>,
          )}
        </StyledCustomerContainer>,
      )}

      {authorizeHelper.canRenderWithRole(
        [Role.ACCOUNTANT, Role.ADMIN],
        <div style={{ marginBottom: 20 }}>
          <Title level={4} type="secondary">
            Lợi Nhuận
          </Title>
          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Lợi nhuận thô sau/trước thuế">
              <Space>
                <Text>
                  {toCurrency(
                    (bill.salePrice || 0) -
                      (bill.purchasePriceAfterVatInVnd || 0),
                  )}
                </Text>
                <Text>/</Text>
                <Text>
                  {toCurrency(
                    (bill.salePrice || 0) - (bill.purchasePriceInVnd || 0),
                  )}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Lợi nhuận thực tạm tính (Khách hàng thanh toán - Thanh toán NCC)">
              {toCurrency(
                (bill.customerPaymentAmount || 0) -
                  (bill.vendorPaymentAmount || 0),
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>,
      )}
    </>
  );
};

export default memo(BillView);
