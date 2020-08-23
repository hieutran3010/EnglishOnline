import React, { memo, useCallback, useState, useEffect } from 'react';
import {
  Typography,
  Popover,
  Descriptions,
  Form,
  InputNumber,
  Button,
  Space,
  Tooltip,
} from 'antd';
import isUndefined from 'lodash/fp/isUndefined';
import isNil from 'lodash/fp/isNil';

import { toCurrency } from 'utils/numberFormat';
import { PurchasePriceInfo } from 'app/models/bill';
import { Role } from 'app/models/user';

const { Text } = Typography;

interface PurchasePriceProps {
  info: PurchasePriceInfo;
  userRole?: Role;
  onPurchasePriceChanged?: (price: PurchasePriceInfo) => void;
}
const PurchasePrice = ({
  info,
  userRole,
  onPurchasePriceChanged,
}: PurchasePriceProps) => {
  const [manualPurchasePriceForm] = Form.useForm();
  const [priceInfo, setPriceInfo] = useState(new PurchasePriceInfo());

  useEffect(() => {
    setPriceInfo(info);
    manualPurchasePriceForm.setFieldsValue({
      manualPurchasePriceInUsd: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info]);

  const onManualPurchasePriceSubmitted = useCallback(
    formData => {
      const { manualPurchasePriceInUsd } = formData;
      if (
        isUndefined(manualPurchasePriceInUsd) ||
        isNil(manualPurchasePriceInUsd)
      ) {
        return;
      }
      const newPriceInfo = new PurchasePriceInfo(priceInfo);
      newPriceInfo.oldPurchasePriceInUsd = newPriceInfo.purchasePriceInUsd;
      newPriceInfo.oldPurchasePriceInVnd = newPriceInfo.purchasePriceInVnd;
      newPriceInfo.oldPurchasePriceAfterVatInUsd =
        newPriceInfo.purchasePriceAfterVatInUsd;
      newPriceInfo.oldPurchasePriceAfterVatInVnd =
        newPriceInfo.purchasePriceAfterVatInVnd;

      newPriceInfo.purchasePriceInUsd = manualPurchasePriceInUsd;
      newPriceInfo.purchasePriceInVnd =
        manualPurchasePriceInUsd * (priceInfo.usdExchangeRate || 0);
      if (priceInfo.vat && priceInfo.vat > 0) {
        newPriceInfo.purchasePriceAfterVatInUsd =
          manualPurchasePriceInUsd * (priceInfo.vat / 100);
      } else {
        newPriceInfo.purchasePriceAfterVatInUsd = manualPurchasePriceInUsd;
      }
      newPriceInfo.purchasePriceAfterVatInVnd =
        (newPriceInfo.purchasePriceAfterVatInUsd || 0) *
        (priceInfo.usdExchangeRate || 0);

      setPriceInfo(newPriceInfo);

      if (onPurchasePriceChanged) {
        onPurchasePriceChanged(newPriceInfo);
      }
    },
    [onPurchasePriceChanged, priceInfo],
  );

  const onCancelManualPrice = useCallback(() => {
    const newPriceInfo = new PurchasePriceInfo(priceInfo);
    newPriceInfo.purchasePriceInUsd = newPriceInfo.oldPurchasePriceInUsd;
    newPriceInfo.purchasePriceInVnd = newPriceInfo.oldPurchasePriceInVnd;
    newPriceInfo.purchasePriceAfterVatInUsd =
      newPriceInfo.oldPurchasePriceAfterVatInUsd;
    newPriceInfo.purchasePriceAfterVatInVnd =
      newPriceInfo.oldPurchasePriceAfterVatInVnd;

    newPriceInfo.oldPurchasePriceInUsd = undefined;
    newPriceInfo.oldPurchasePriceInVnd = undefined;
    newPriceInfo.oldPurchasePriceAfterVatInUsd = undefined;
    newPriceInfo.oldPurchasePriceAfterVatInVnd = undefined;

    setPriceInfo(newPriceInfo);

    if (onPurchasePriceChanged) {
      onPurchasePriceChanged(newPriceInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceInfo, onPurchasePriceChanged]);

  const getManualEditPurchasePriceComp = useCallback(() => {
    if (userRole !== Role.ADMIN || !priceInfo.purchasePriceInUsd) {
      return <></>;
    }

    if (!priceInfo.oldPurchasePriceInUsd) {
      return (
        <Form
          form={manualPurchasePriceForm}
          layout="inline"
          size="small"
          noValidate
          onFinish={onManualPurchasePriceSubmitted}
        >
          <Tooltip title="Nhập và sau đó nhấn Enter">
            <Form.Item name="manualPurchasePriceInUsd">
              <InputNumber
                ref={(ref: any) => ref?.focus()}
                placeholder="Giá mua khác?"
                style={{ width: 150 }}
              />
            </Form.Item>
          </Tooltip>
        </Form>
      );
    }

    return (
      <Button size="small" type="primary" onClick={onCancelManualPrice}>
        Hủy giá mua nhập tay
      </Button>
    );
  }, [
    manualPurchasePriceForm,
    onCancelManualPrice,
    onManualPurchasePriceSubmitted,
    priceInfo.oldPurchasePriceInUsd,
    priceInfo.purchasePriceInUsd,
    userRole,
  ]);

  return (
    <Popover
      title="Công thức cấu thành Giá mua"
      content={
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="1/ Trọng Lượng">
            {priceInfo.weightInKg}kg
          </Descriptions.Item>
          <Descriptions.Item label="2/ Nước Đến">
            {priceInfo.destinationCountry}
          </Descriptions.Item>
          <Descriptions.Item label="3/ Zone">
            {priceInfo.zoneName}
          </Descriptions.Item>

          <Descriptions.Item label="4/ Báo Giá NCC (USD)" span={3}>
            ${priceInfo.quotationPriceInUsd}
          </Descriptions.Item>

          {priceInfo.vendorNetPriceInUsd === priceInfo.quotationPriceInUsd && (
            <Descriptions.Item label="5/ Giá Net (USD) = (4)">
              ${priceInfo.vendorNetPriceInUsd}
            </Descriptions.Item>
          )}
          {(priceInfo.vendorNetPriceInUsd || 0) >
            (priceInfo.quotationPriceInUsd || 0) && (
            <Descriptions.Item label="5/ Giá Net (USD) = (1) x (4)">
              ${priceInfo.vendorNetPriceInUsd}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="6/ Phí Khác (USD)">
            ${priceInfo.vendorOtherFee}
          </Descriptions.Item>
          <Descriptions.Item label="7/ Phí Nhiên Liệu (%)">
            {priceInfo.vendorFuelChargePercent}% = $
            {priceInfo.vendorFuelChargeFeeInUsd || 0} ={' '}
            {toCurrency(priceInfo.vendorFuelChargeFeeInVnd || 0)}
          </Descriptions.Item>

          <Descriptions.Item
            label="8/ Tổng Cộng (USD) = [(5) + (6)] x (7)"
            span={3}
          >
            <Space>
              {toCurrency(priceInfo.purchasePriceInUsd || 0, true)}
              {priceInfo.oldPurchasePriceInUsd && (
                <Text delete>
                  {toCurrency(priceInfo.oldPurchasePriceInUsd || 0, true)}
                </Text>
              )}
              {getManualEditPurchasePriceComp()}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="9/ Thuế GTGT (%)">
            {priceInfo.vat || 0}%
          </Descriptions.Item>
          <Descriptions.Item label="10/ Tỉ giá" span={2}>
            {toCurrency(priceInfo.usdExchangeRate)}
          </Descriptions.Item>

          <Descriptions.Item
            label="Tổng Cộng (VNĐ) = (8) X (9) X (10)"
            span={3}
          >
            <Space>
              {toCurrency(priceInfo.purchasePriceAfterVatInVnd || 0)}
              {priceInfo.oldPurchasePriceAfterVatInVnd && (
                <Text delete>
                  {toCurrency(priceInfo.oldPurchasePriceAfterVatInVnd || 0)}
                </Text>
              )}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      }
    >
      <Text mark>
        <Space>
          <Space>
            {priceInfo.oldPurchasePriceAfterVatInVnd && (
              <Text delete>
                {toCurrency(priceInfo.oldPurchasePriceAfterVatInVnd || 0)}
              </Text>
            )}
            {toCurrency(priceInfo.purchasePriceAfterVatInVnd || 0)}
          </Space>
          =
          <Space>
            {toCurrency(priceInfo.purchasePriceAfterVatInUsd || 0, true)}
            {priceInfo.oldPurchasePriceAfterVatInUsd && (
              <Text delete>
                {toCurrency(priceInfo.oldPurchasePriceAfterVatInUsd || 0, true)}
              </Text>
            )}
          </Space>
        </Space>
      </Text>
    </Popover>
  );
};

export default memo(PurchasePrice);
