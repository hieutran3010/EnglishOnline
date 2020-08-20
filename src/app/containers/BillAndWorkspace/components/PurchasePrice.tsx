import React, { memo } from 'react';
import { Typography, Popover, Descriptions } from 'antd';
import { toCurrency } from 'utils/numberFormat';
import { PurchasePriceInfo } from 'app/models/bill';

const { Text } = Typography;

interface PurchasePriceProps {
  info: PurchasePriceInfo;
}
const PurchasePrice = ({ info }: PurchasePriceProps) => {
  return (
    <Popover
      title="Công thức cấu thành Giá mua"
      content={
        <Descriptions bordered size="small">
          <Descriptions.Item label="1/ Trọng Lượng">
            {info.weightInKg}kg
          </Descriptions.Item>
          <Descriptions.Item label="2/ Nước Đến">
            {info.destinationCountry}
          </Descriptions.Item>
          <Descriptions.Item label="3/ Zone">{info.zoneName}</Descriptions.Item>
          <Descriptions.Item label="4/ Báo Giá NCC (USD)" span={6}>
            ${info.quotationPriceInUsd}
          </Descriptions.Item>
          {info.vendorNetPriceInUsd === info.quotationPriceInUsd && (
            <Descriptions.Item label="5/ Giá Net (USD) = (4)">
              ${info.vendorNetPriceInUsd}
            </Descriptions.Item>
          )}
          {(info.vendorNetPriceInUsd || 0) >
            (info.quotationPriceInUsd || 0) && (
            <Descriptions.Item label="5/ Giá Net (USD) = (1) x (4)">
              ${info.vendorNetPriceInUsd}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="6/ Phí Khác (USD)">
            ${info.vendorOtherFee}
          </Descriptions.Item>
          <Descriptions.Item label="7/ Phí Nhiên Liệu (%)">
            {info.vendorFuelChargePercent}% = $
            {info.vendorFuelChargeFeeInUsd || 0} ={' '}
            {toCurrency(info.vendorFuelChargeFeeInVnd || 0)}
          </Descriptions.Item>
          <Descriptions.Item
            label="8/ Tổng Cộng (USD) = [(5) + (6)] x (7)"
            span={6}
          >
            ${info.purchasePriceInUsd || 0}
          </Descriptions.Item>
          <Descriptions.Item label="9/ Thuế GTGT (%)" span={2}>
            {info.vat || 0}%
          </Descriptions.Item>
          <Descriptions.Item label="10/ Tỉ giá" span={2}>
            {toCurrency(info.usdExchangeRate)}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng Cộng (VNĐ) = (8) X (9) X (10)">
            {toCurrency(info.purchasePriceAfterVatInVnd || 0)}
          </Descriptions.Item>
        </Descriptions>
      }
    >
      <Text mark>
        {toCurrency(info.purchasePriceAfterVatInVnd || 0)} ={' '}
        {toCurrency(info.purchasePriceAfterVatInUsd || 0, true)}
      </Text>
    </Popover>
  );
};

export default memo(PurchasePrice);
