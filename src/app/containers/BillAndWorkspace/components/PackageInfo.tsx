import React, { memo } from 'react';
import { Typography, Form, InputNumber, Input, Tooltip } from 'antd';
import isEmpty from 'lodash/fp/isEmpty';
import isUndefined from 'lodash/fp/isUndefined';
import isNil from 'lodash/fp/isNil';

import { BillValidator } from 'app/models/validators/billValidator';
import type Vendor from 'app/models/vendor';
import { Role } from 'app/models/user';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { AutoComplete } from 'app/components/collection/AutoComplete';

import VendorSelection from './VendorSelection';
import IntParcelVendorSelect from './IntParcelVendorSelect';
import VendorCountriesSelection from './VendorCountriesSelection';
import VendorWeightAdjustment from '../components/VendorWeightAdjustment';
import { PurchasePriceCountingResult } from 'app/models/purchasePriceCounting';
import { BillQuotation } from 'app/models/bill';
import Zone from 'app/models/zone';

const { Title, Text } = Typography;

const billDescriptionDataSource = getDataSource(FETCHER_KEY.BILL_DESCRIPTION);

interface Props {
  billValidator: BillValidator;
  vendors: Vendor[];
  isFetchingVendors: boolean;
  vendorCountries: string[];
  isFetchingVendorCountries: boolean;
  onVendorSelectionChanged: (vendorId: string | undefined) => void;
  onSelectedCountryChanged: (country?: string) => void;
  userRole: Role;
  onVendorWeightChanged?: (
    oldWeight: number,
    newWeight: number,
    predictPurchasePrice: PurchasePriceCountingResult,
  ) => void;
  onRestoreSaleWeight?: (
    saleWeight: number,
    purchasePrice: PurchasePriceCountingResult,
  ) => void;
  oldWeightInKg?: number;
  billForm: any;
  billId: string;
  purchasePriceInUsd: number;
  billQuotations: BillQuotation[];
  isUseLatestQuotation: boolean;
  services?: string[];
  relatedZones?: Zone[];
  onServiceChanged: (value) => void;
}
const PackageInfo = ({
  billValidator,
  vendors,
  isFetchingVendors,
  vendorCountries,
  isFetchingVendorCountries,
  onVendorSelectionChanged,
  userRole,
  onVendorWeightChanged,
  onRestoreSaleWeight,
  oldWeightInKg,
  billForm,
  billId,
  purchasePriceInUsd,
  billQuotations,
  isUseLatestQuotation,
  services,
  relatedZones,
  onSelectedCountryChanged,
  onServiceChanged,
}: Props) => {
  return (
    <>
      <Title level={4} type="secondary">
        Thông tin hàng
      </Title>
      <Form.Item
        name="vendorId"
        label="Nhà cung cấp"
        rules={billValidator.vendorId}
      >
        <VendorSelection
          vendors={vendors}
          loading={isFetchingVendors}
          onChange={onVendorSelectionChanged}
        />
      </Form.Item>

      <Form.Item
        name="destinationCountry"
        label="Nước đến"
        rules={billValidator.destinationCountry}
      >
        <VendorCountriesSelection
          countries={vendorCountries}
          loading={isFetchingVendorCountries}
          onChange={onSelectedCountryChanged}
        />
      </Form.Item>

      <Form.Item
        name="internationalParcelVendor"
        label="Dịch vụ"
        rules={billValidator.internationalParcelVendor}
      >
        <IntParcelVendorSelect
          services={services}
          relatedzones={relatedZones}
          onChange={onServiceChanged}
        />
      </Form.Item>

      <Form.Item label="Trọng lượng (kg)" required>
        <Input.Group compact>
          <Form.Item name="weightInKg" rules={billValidator.weightInKg} noStyle>
            <InputNumber precision={2} min={0} />
          </Form.Item>
          {!isUndefined(oldWeightInKg) && !isNil(oldWeightInKg) && (
            <Tooltip title="Ký bán cho khách">
              <Text delete style={{ marginLeft: 10, marginRight: 10 }}>
                {oldWeightInKg}
              </Text>
            </Tooltip>
          )}
          {!isEmpty(billId) &&
            [Role.ADMIN, Role.ACCOUNTANT].includes(userRole) && (
              <VendorWeightAdjustment
                bill={billForm}
                onSaveNewWeight={onVendorWeightChanged}
                onRestoreSaleWeight={onRestoreSaleWeight}
                oldWeightInKg={oldWeightInKg}
                purchasePriceInUsd={purchasePriceInUsd}
                billQuotations={billQuotations}
                isUseLatestQuotation={isUseLatestQuotation}
              />
            )}
        </Input.Group>
      </Form.Item>

      <Form.Item
        name="description"
        label="Loại hàng"
        rules={billValidator.description}
      >
        <AutoComplete
          fetchDataSource={billDescriptionDataSource}
          searchPropNames={['name']}
          displayPath="name"
          minSearchLength={2}
          valuePath="name"
          placeholder="Tìm kiếm"
        />
      </Form.Item>

      <Form.Item
        name="airlineBillId"
        label="Bill hãng bay"
        rules={billValidator.airlineBillId}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="childBillId"
        label="Bill con"
        rules={billValidator.childBillId}
      >
        <Input />
      </Form.Item>
    </>
  );
};

export default memo(PackageInfo);
