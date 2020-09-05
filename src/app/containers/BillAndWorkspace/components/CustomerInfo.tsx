import React, { memo } from 'react';
import { Typography, Form, Input, Checkbox } from 'antd';

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
import { isEmpty } from 'lodash';

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
          />
        </Form.Item>
        <Form.Item
          name="senderPhone"
          label="Số ĐT"
          rules={billValidator.senderPhone}
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
          />
        </Form.Item>
        <Form.Item
          name="senderAddress"
          label="Địa chỉ"
          rules={billValidator.senderAddress}
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
          />
        </Form.Item>
        <Form.Item
          name="receiverPhone"
          label="Số ĐT"
          rules={billValidator.receiverPhone}
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
          />
        </Form.Item>
        <Form.Item
          name="receiverAddress"
          label="Địa chỉ"
          rules={billValidator.receiverAddress}
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
