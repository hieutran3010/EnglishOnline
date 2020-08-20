import React, { memo } from 'react';
import { Typography, Popover, Descriptions } from 'antd';
import { toCurrency } from 'utils/numberFormat';
import type Bill from 'app/models/bill';

const { Text } = Typography;

interface PurchasePriceProps {
  bill: Bill;
}
const PurchasePrice = ({ bill }: PurchasePriceProps) => {
  return (
    <Popover
      title="Công thức cấu thành Giá mua"
      content={
        <Descriptions bordered size="small">
          <Descriptions.Item label="1/ Trọng Lượng">
            {bill.weightInKg}kg
          </Descriptions.Item>
          <Descriptions.Item label="2/ Nước Đến">
            {bill.destinationCountry}
          </Descriptions.Item>
          <Descriptions.Item label="3/ Zone">{bill.zoneName}</Descriptions.Item>
          <Descriptions.Item label="4/ Báo Giá NCC (USD)" span={6}>
            ${bill.quotationPriceInUsd}
          </Descriptions.Item>
          {bill.vendorNetPriceInUsd === bill.quotationPriceInUsd && (
            <Descriptions.Item label="5/ Giá Net (USD) = (4)">
              ${bill.vendorNetPriceInUsd}
            </Descriptions.Item>
          )}
          {(bill.vendorNetPriceInUsd || 0) >
            (bill.quotationPriceInUsd || 0) && (
            <Descriptions.Item label="5/ Giá Net (USD) = (1) x (4)">
              ${bill.vendorNetPriceInUsd}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="6/ Phí Khác (USD)">
            ${bill.vendorOtherFee}
          </Descriptions.Item>
          <Descriptions.Item label="7/ Phí Nhiên Liệu (%)">
            {bill.vendorFuelChargePercent}% = $
            {bill.vendorFuelChargeFeeInUsd || 0} ={' '}
            {toCurrency(bill.vendorFuelChargeFeeInVnd || 0)}
          </Descriptions.Item>
          <Descriptions.Item
            label="8/ Tổng Cộng (USD) = [(5) + (6)] x (7)"
            span={6}
          >
            ${bill.purchasePriceInUsd || 0}
          </Descriptions.Item>
          <Descriptions.Item label="9/ Thuế GTGT (%)" span={2}>
            {bill.vat || 0}%
          </Descriptions.Item>
          <Descriptions.Item label="10/ Tỉ giá" span={2}>
            {toCurrency(bill.usdExchangeRate)}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng Cộng (VNĐ) = (8) X (9) X (10)">
            {toCurrency(bill.purchasePriceAfterVatInVnd || 0)}
          </Descriptions.Item>
        </Descriptions>
      }
    >
      <Text mark>
        {toCurrency(bill.purchasePriceAfterVatInVnd || 0)} ={' '}
        {toCurrency(bill.purchasePriceAfterVatInUsd || 0, true)}
      </Text>
    </Popover>
  );
};

export default memo(PurchasePrice);
