import React, { memo, useCallback, useEffect, useState } from 'react';
import { Typography, Form, Input } from 'antd';
import {
  StyledCustomerContainer,
  StyledSenderContainer,
  StyledCustomerSelectionContainer,
  StyledReceiverContainer,
} from '../Workspace/styles/StyledIndex';
import PaymentSelect from './PaymentSelect';
import { CurrencyInput } from 'app/components/Input';
import { PAYMENT_TYPE } from 'app/models/bill';

const { Title } = Typography;

const paymentLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 13 },
};

interface Props {
  onCustomerPaymentAmountFocused: () => void;
  onVendorPaymentAmountFocused: () => void;
  selectedPaymentType?: PAYMENT_TYPE;
}
const Payment = ({
  onCustomerPaymentAmountFocused,
  onVendorPaymentAmountFocused,
  selectedPaymentType,
}: Props) => {
  const [
    selectedCustomerPaymentType,
    setSelectedCustomerPaymentType,
  ] = useState<PAYMENT_TYPE | undefined>();

  useEffect(() => {
    setSelectedCustomerPaymentType(selectedPaymentType);
  }, [selectedPaymentType]);

  const onCustomerPaymentTypeChanged = useCallback(value => {
    setSelectedCustomerPaymentType(value);
  }, []);

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
          <PaymentSelect isBothType onChange={onCustomerPaymentTypeChanged} />
        </Form.Item>
        {selectedCustomerPaymentType !==
          PAYMENT_TYPE.CASH_AND_BANK_TRANSFER && (
          <Form.Item
            label="Đã thanh toán (VNĐ)"
            name="customerPaymentAmount"
            {...paymentLayout}
          >
            <CurrencyInput onFocus={onCustomerPaymentAmountFocused} />
          </Form.Item>
        )}
        {selectedCustomerPaymentType ===
          PAYMENT_TYPE.CASH_AND_BANK_TRANSFER && (
          <Form.Item label="Đã thanh toán (TM-CK)" {...paymentLayout}>
            <Input.Group compact>
              <Form.Item name="customerPaymentAmount" noStyle>
                <CurrencyInput
                  onFocus={onCustomerPaymentAmountFocused}
                  placeholder="Tiền mặt"
                  style={{ width: '50%' }}
                />
              </Form.Item>
              <Form.Item name="otherCustomerPaymentAmount" noStyle>
                <CurrencyInput
                  placeholder="Chuyển khoản"
                  style={{ width: '50%' }}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        )}
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
