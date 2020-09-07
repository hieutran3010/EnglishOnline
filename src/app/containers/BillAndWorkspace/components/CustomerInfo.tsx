import React, { memo, useCallback } from 'react';
import { Typography, Form, Input, Checkbox } from 'antd';
import { isEmpty, trimStart } from 'lodash';

import { AutoComplete } from 'app/components/collection/AutoComplete';

import { BillValidator } from 'app/models/validators/billValidator';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import type Customer from 'app/models/customer';

import {
  StyledCustomerContainer,
  StyledSenderContainer,
  StyledCustomerSelectionContainer,
  StyledReceiverContainer,
} from '../Workspace/styles/StyledIndex';
import { formatPhoneNumber } from 'utils/numberFormat';

const { Title } = Typography;

const customerDataSource = getDataSource(FETCHER_KEY.CUSTOMER);
customerDataSource.orderByFields = 'name';

interface Props {
  billValidator: BillValidator;
  onSenderSelectionChanged: (sender: Customer) => void;
  onReceiverSelectionChanged: (receiver: Customer) => void;
  senderId?: string;
  receiverId?: string;
}
const CustomerInfo = ({
  billValidator,
  onSenderSelectionChanged,
  onReceiverSelectionChanged,
  senderId,
  receiverId,
}: Props) => {
  const onNormalizePhoneNumber = useCallback(
    (value, _prevValue, _prevValues) => {
      return formatPhoneNumber(value);
    },
    [],
  );

  const onNormalizePhoneSearchKey = useCallback((searchKey: string) => {
    return formatPhoneNumber(searchKey);
  }, []);

  const onNormalizeNameAndAddress = useCallback(
    (value, _prevValue, _prevValues) => {
      const formatted = trimStart(value, '- ');
      return formatted;
    },
    [],
  );

  const onNormalizeNameSearchKey = useCallback((searchKey: string) => {
    return trimStart(searchKey, '- ');
  }, []);

  return (
    <StyledCustomerContainer>
      <StyledSenderContainer>
        <StyledCustomerSelectionContainer>
          <Title level={4} type="secondary">
            Khách gởi
          </Title>
        </StyledCustomerSelectionContainer>
        <Form.Item
          name="senderName"
          label="Tên"
          rules={billValidator.senderName}
          normalize={onNormalizeNameAndAddress}
        >
          <AutoComplete
            fetchDataSource={customerDataSource}
            searchPropNames={['name']}
            displayPath="name"
            minSearchLength={2}
            valuePath="name"
            placeholder="Nhập Tên khách gởi để tìm"
            excludeValue={receiverId}
            excludePath="id"
            onSelected={onSenderSelectionChanged}
            onNormalizeSearchKey={onNormalizeNameSearchKey}
          />
        </Form.Item>
        <Form.Item
          name="senderPhone"
          label="Số ĐT"
          rules={billValidator.senderPhone}
          normalize={onNormalizePhoneNumber}
        >
          <AutoComplete
            fetchDataSource={customerDataSource}
            searchPropNames={['phone']}
            displayPath="phone"
            minSearchLength={2}
            valuePath="phone"
            placeholder="Nhập số điện thoại khách gởi để tìm"
            excludeValue={receiverId}
            excludePath="id"
            onSelected={onSenderSelectionChanged}
            onNormalizeSearchKey={onNormalizePhoneSearchKey}
          />
        </Form.Item>
        <Form.Item
          name="senderAddress"
          label="Địa chỉ"
          rules={billValidator.senderAddress}
          normalize={onNormalizeNameAndAddress}
        >
          <Input />
        </Form.Item>
        {(!senderId || isEmpty(senderId)) && (
          <Form.Item
            name="isSaveSender"
            label=" "
            colon={false}
            valuePropName="checked"
          >
            <Checkbox>Lưu khách gởi này</Checkbox>
          </Form.Item>
        )}
      </StyledSenderContainer>
      <StyledReceiverContainer>
        <StyledCustomerSelectionContainer>
          <Title level={4} type="secondary">
            Khách nhận
          </Title>
        </StyledCustomerSelectionContainer>
        <Form.Item
          name="receiverName"
          label="Tên"
          rules={billValidator.receiverName}
          normalize={onNormalizeNameAndAddress}
        >
          <AutoComplete
            fetchDataSource={customerDataSource}
            searchPropNames={['name']}
            displayPath="name"
            minSearchLength={2}
            valuePath="name"
            placeholder="Nhập Tên để tìm"
            excludeValue={senderId}
            onSelected={onReceiverSelectionChanged}
            excludePath="id"
            onNormalizeSearchKey={onNormalizeNameSearchKey}
          />
        </Form.Item>
        <Form.Item
          name="receiverPhone"
          label="Số ĐT"
          rules={billValidator.receiverPhone}
          normalize={onNormalizePhoneNumber}
        >
          <AutoComplete
            fetchDataSource={customerDataSource}
            searchPropNames={['phone']}
            displayPath="phone"
            minSearchLength={2}
            valuePath="phone"
            placeholder="Nhập Số điện thoại để tìm"
            excludeValue={senderId}
            onSelected={onReceiverSelectionChanged}
            excludePath="id"
            onNormalizeSearchKey={onNormalizePhoneSearchKey}
          />
        </Form.Item>
        <Form.Item
          name="receiverAddress"
          label="Địa chỉ"
          rules={billValidator.receiverAddress}
          normalize={onNormalizeNameAndAddress}
        >
          <Input />
        </Form.Item>
        {(!receiverId || isEmpty(receiverId)) && (
          <Form.Item
            name="isSaveReceiver"
            label=" "
            colon={false}
            valuePropName="checked"
          >
            <Checkbox>Lưu khách nhận này</Checkbox>
          </Form.Item>
        )}
      </StyledReceiverContainer>
    </StyledCustomerContainer>
  );
};

export default memo(CustomerInfo);
