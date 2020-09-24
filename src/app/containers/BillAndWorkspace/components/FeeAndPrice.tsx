import React, { memo, useCallback } from 'react';
import {
  InputNumber,
  Form,
  Typography,
  Space,
  Checkbox,
  Button,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { RetweetOutlined } from '@ant-design/icons';

import { CurrencyInput } from 'app/components/Input';
import { BillValidator } from 'app/models/validators/billValidator';
import { Role } from 'app/models/user';

import { StyledFeeContainer } from '../Workspace/styles/StyledIndex';
import { PurchasePriceInfo } from 'app/models/bill';
import PurchasePrice from './PurchasePrice';

const { Title, Text } = Typography;

const feeLayout = {
  labelCol: { span: 13 },
  wrapperCol: { span: 15 },
};

interface Props {
  billValidator: BillValidator;
  onVatCheckingChanged: (checked: boolean) => void;
  hasVat: boolean;
  shouldRecalculatePurchasePrice?: boolean;
  onCalculatePurchasePrice?: () => void;
  isCalculating?: boolean;
  disabledCalculation?: boolean;
  purchasePriceInfo: PurchasePriceInfo;
  userRole: Role;
  onPurchasePriceManuallyChanged?: (price: PurchasePriceInfo) => void;
}
const FeeAndPrice = ({
  billValidator,
  onVatCheckingChanged,
  hasVat,
  shouldRecalculatePurchasePrice,
  onCalculatePurchasePrice,
  isCalculating,
  disabledCalculation,
  purchasePriceInfo,
  userRole,
  onPurchasePriceManuallyChanged,
}: Props) => {
  const onVatHavingChanged = useCallback(
    e => {
      const checked = e.target.checked;
      onVatCheckingChanged(checked);
    },
    [onVatCheckingChanged],
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <Title level={4} type="secondary">
          Phí & Giá
        </Title>
        {shouldRecalculatePurchasePrice && (
          <Text
            type="warning"
            strong
            style={{ marginBottom: 8, marginLeft: 8 }}
          >
            Có sự thay đổi dữ liệu ảnh hưởng tới Giá mua, vui lòng tính lại Giá
            mua!
          </Text>
        )}
      </div>

      <StyledFeeContainer>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 6 }}
          >
            <Form.Item
              name="vendorOtherFee"
              label="Phí khác (USD)"
              rules={billValidator.vendorOtherFee}
              {...feeLayout}
              style={{ marginBottom: 0 }}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 6 }}
          >
            <Form.Item
              name="vendorFuelChargePercent"
              label="Phí nhiên liệu (%)"
              labelAlign="right"
              rules={billValidator.vendorFuelChargePercent}
              style={{ marginBottom: 0 }}
              {...feeLayout}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 6 }}
          >
            <Form.Item
              name="vat"
              labelAlign="right"
              rules={billValidator.vat}
              style={{ marginBottom: 0 }}
              label={
                <Space>
                  <Checkbox checked={hasVat} onChange={onVatHavingChanged}>
                    VAT (%)
                  </Checkbox>
                </Space>
              }
              labelCol={{ span: 11 }}
            >
              <InputNumber min={0} disabled={!hasVat} />
            </Form.Item>
          </Col>
          <Col
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 6 }}
          >
            <Form.Item
              name="usdExchangeRate"
              label="Tỉ giá USD"
              labelAlign="right"
              labelCol={{ span: 9 }}
              style={{ marginBottom: 0 }}
              rules={billValidator.usdExchangeRate}
            >
              <CurrencyInput />
            </Form.Item>
          </Col>
        </Row>
      </StyledFeeContainer>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={24}>
          <Form.Item label="Giá mua (USD = VNĐ)">
            <PurchasePrice
              info={purchasePriceInfo}
              userRole={userRole}
              onPurchasePriceChanged={onPurchasePriceManuallyChanged}
            />
            <Tooltip title="Tính giá mua">
              <Button
                size="small"
                type="primary"
                shape="circle"
                icon={<RetweetOutlined />}
                style={{ marginLeft: 10 }}
                onClick={onCalculatePurchasePrice}
                loading={isCalculating}
                disabled={disabledCalculation}
              />
            </Tooltip>
          </Form.Item>
          <Form.Item
            name="salePrice"
            label="Giá bán (VNĐ)"
            rules={billValidator.salePrice}
          >
            <CurrencyInput />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default memo(FeeAndPrice);
