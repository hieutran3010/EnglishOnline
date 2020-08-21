import React, { memo, useState, useCallback, useMemo } from 'react';
import moment from 'moment';
import { Divider, Typography, Descriptions, Button, Space, Tag } from 'antd';

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

const { Title } = Typography;

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
}
const BillView = ({ bill, onArchiveBill, onPrintedVat }: Props) => {
  const [isRequestedPrinted, setIsRequestedPrinted] = useState(false);

  const onRequestPrintedVat = useCallback(() => {
    if (onPrintedVat) {
      onPrintedVat(bill);
      setIsRequestedPrinted(true);
    }
  }, [bill, onPrintedVat]);

  const purchasePriceInfo = useMemo(() => {
    return bill.getPurchasePriceInfo();
  }, [bill]);

  return (
    <>
      <StyledDateAndAssigneeContainer>
        <div>
          {bill.status === BILL_STATUS.DONE &&
            !bill.isArchived &&
            onArchiveBill &&
            authorizeHelper.canRenderWithRole(
              [Role.ACCOUNTANT, Role.ADMIN],
              <Button
                danger
                onClick={onArchiveBill(bill)}
                style={{ marginRight: 10 }}
              >
                Hủy bill
              </Button>,
            )}
          <span>{moment(bill.date).format('DD-MM-YYYY')}</span>
        </div>

        <div>
          <BillStatusTag status={bill.status} />
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

      <Divider type="horizontal" orientation="center" />

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
            {bill.weightInKg}kg
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
            <Descriptions.Item label="Trước Thuế">
              {toCurrency(bill.profitBeforeTax || 0)}
            </Descriptions.Item>
            <Descriptions.Item label="Sau Thuế">
              {toCurrency(bill.profit || 0)}
            </Descriptions.Item>
          </Descriptions>
        </div>,
      )}
    </>
  );
};

export default memo(BillView);
