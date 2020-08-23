import React, { memo, useCallback } from 'react';
import {
  InputNumber,
  Form,
  Typography,
  Space,
  Checkbox,
  Button,
  Tooltip,
  Alert,
} from 'antd';
import { RetweetOutlined } from '@ant-design/icons';

import { CurrencyInput } from 'app/components/Input';
import { BillValidator } from 'app/models/validators/billValidator';
import { Role } from 'app/models/user';
import { authorizeHelper } from 'app/services/auth';

import {
  StyledFeeContainer,
  StyledFeeItemContainer,
} from '../Workspace/styles/StyledIndex';
import { PurchasePriceInfo } from 'app/models/bill';
import PurchasePrice from './PurchasePrice';

const { Title } = Typography;

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
      {authorizeHelper.canRenderWithRole(
        [Role.ACCOUNTANT],
        <>
          <Space>
            <Title level={4} type="secondary">
              Phí & Giá
            </Title>
            {shouldRecalculatePurchasePrice && (
              <Alert
                message="Có sự thay đổi dữ liệu ảnh hưởng tới Giá mua, vui lòng tính lại Giá mua!"
                showIcon
                banner
              />
            )}
          </Space>
          <StyledFeeContainer>
            <StyledFeeItemContainer>
              <Form.Item
                name="vendorOtherFee"
                label="Phí khác (USD)"
                labelAlign="right"
                rules={billValidator.vendorOtherFee}
                {...feeLayout}
              >
                <InputNumber min={0} />
              </Form.Item>
            </StyledFeeItemContainer>
            <StyledFeeItemContainer>
              <Form.Item
                name="vendorFuelChargePercent"
                label="Phí nhiên liệu (%)"
                labelAlign="right"
                rules={billValidator.vendorFuelChargePercent}
                {...feeLayout}
              >
                <InputNumber min={0} />
              </Form.Item>
            </StyledFeeItemContainer>
            <StyledFeeItemContainer>
              <Form.Item
                name="vat"
                labelAlign="right"
                rules={billValidator.vat}
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
            </StyledFeeItemContainer>
            <StyledFeeItemContainer>
              <Form.Item
                name="usdExchangeRate"
                label="Tỉ giá USD"
                labelAlign="right"
                labelCol={{ span: 9 }}
                rules={billValidator.usdExchangeRate}
              >
                <CurrencyInput />
              </Form.Item>
            </StyledFeeItemContainer>
          </StyledFeeContainer>
          <Form.Item label="Giá mua (USD = VNĐ)">
            <PurchasePrice
              info={purchasePriceInfo}
              userRole={userRole}
              onPurchasePriceChanged={onPurchasePriceManuallyChanged}
            />
            <Tooltip title="Tính lại Giá mua">
              <Button
                size="small"
                shape="circle"
                type="primary"
                icon={<RetweetOutlined />}
                style={{ marginLeft: 10 }}
                onClick={onCalculatePurchasePrice}
                loading={isCalculating}
                disabled={disabledCalculation}
              ></Button>
            </Tooltip>
          </Form.Item>
          <Form.Item
            name="salePrice"
            label="Giá bán (VNĐ)"
            rules={billValidator.salePrice}
          >
            <CurrencyInput />
          </Form.Item>
        </>,
      )}
    </>
  );
};

export default memo(FeeAndPrice);
