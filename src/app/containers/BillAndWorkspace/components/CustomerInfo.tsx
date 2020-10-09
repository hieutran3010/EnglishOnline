import React, { memo, useCallback } from 'react';
import { Typography, Form, Input, Checkbox, Row, Col } from 'antd';
import { isEmpty, trimStart } from 'lodash';

import { AutoComplete } from 'app/components/collection/AutoComplete';

import { BillValidator } from 'app/models/validators/billValidator';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import type Customer from 'app/models/customer';

import { StyledCustomerSelectionContainer } from '../Workspace/styles/StyledIndex';
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
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col
        xs={{ span: 24 }}
        sm={{ span: 24 }}
        md={{ span: 12 }}
        lg={{ span: 12 }}
      >
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
            searchPropNames={['name', 'nameNonUnicode']}
            displayPath="name"
            minSearchLength={2}
            valuePath="id"
            placeholder="Nhập Tên khách gởi để tìm"
            excludeValue={receiverId}
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
            valuePath="id"
            placeholder="Nhập số điện thoại khách gởi để tìm"
            excludeValue={receiverId}
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
          <Form.Item name="isSaveSender" valuePropName="checked">
            <Checkbox>Lưu khách gởi này</Checkbox>
          </Form.Item>
        )}
      </Col>

      <Col
        xs={{ span: 24 }}
        sm={{ span: 24 }}
        md={{ span: 12 }}
        lg={{ span: 12 }}
      >
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
            searchPropNames={['name', 'nameNonUnicode']}
            displayPath="name"
            minSearchLength={2}
            valuePath="id"
            placeholder="Nhập Tên để tìm"
            excludeValue={senderId}
            onSelected={onReceiverSelectionChanged}
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
            valuePath="id"
            placeholder="Nhập Số điện thoại để tìm"
            excludeValue={senderId}
            onSelected={onReceiverSelectionChanged}
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
          <Form.Item name="isSaveReceiver" valuePropName="checked" noStyle>
            <Checkbox>Lưu khách nhận này</Checkbox>
          </Form.Item>
        )}
      </Col>
    </Row>
  );
};

export default memo(CustomerInfo);
