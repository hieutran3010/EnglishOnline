import React, { memo } from 'react';
import { Typography, Form } from 'antd';
import {
  StyledCustomerContainer,
  StyledSenderContainer,
  StyledCustomerSelectionContainer,
  StyledReceiverContainer,
} from '../Workspace/styles/StyledIndex';
import PaymentSelect from './PaymentSelect';
import { CurrencyInput } from 'app/components/Input';

const { Title } = Typography;

const paymentLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 13 },
};

interface Props {
  onCustomerPaymentAmountFocused: () => void;
  onVendorPaymentAmountFocused: () => void;
}
const Payment = ({
  onCustomerPaymentAmountFocused,
  onVendorPaymentAmountFocused,
}: Props) => {
  return (
    <StyledCustomerContainer>
      <StyledSenderContainer>
        <StyledCustomerSelectionContainer>
          <Title level={4} type="secondary">
            Khách Hàng Thanh Toán
          </Title>
        </StyledCustomerSelectionContainer>
        <Form.Item
          name="customerPaymentType"
          label="Hình thức"
          {...paymentLayout}
        >
          <PaymentSelect />
        </Form.Item>
        <Form.Item
          label="Đã thanh toán (VNĐ)"
          name="customerPaymentAmount"
          {...paymentLayout}
        >
          <CurrencyInput onFocus={onCustomerPaymentAmountFocused} />
        </Form.Item>
        <Form.Item
          label="Còn nợ (VNĐ)"
          name="customerPaymentDebt"
          {...paymentLayout}
        >
          <CurrencyInput />
        </Form.Item>
      </StyledSenderContainer>
      <StyledReceiverContainer>
        <StyledCustomerSelectionContainer>
          <Title level={4} type="secondary">
            Thanh Toán NCC
          </Title>
        </StyledCustomerSelectionContainer>
        <Form.Item
          name="vendorPaymentType"
          label="Hình thức"
          {...paymentLayout}
        >
          <PaymentSelect />
        </Form.Item>
        <Form.Item
          label="Đã thanh toán (VNĐ)"
          name="vendorPaymentAmount"
          {...paymentLayout}
        >
          <CurrencyInput onFocus={onVendorPaymentAmountFocused} />
        </Form.Item>
        <Form.Item
          label="Còn nợ (VNĐ)"
          name="vendorPaymentDebt"
          {...paymentLayout}
        >
          <CurrencyInput />
        </Form.Item>
      </StyledReceiverContainer>
    </StyledCustomerContainer>
  );
};

export default memo(Payment);
