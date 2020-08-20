import React, { memo } from 'react';
import { Typography, Form, InputNumber, Input } from 'antd';
import isEmpty from 'lodash/fp/isEmpty';

import { BillValidator } from 'app/models/validators/billValidator';
import type Vendor from 'app/models/vendor';
import { Role } from 'app/models/user';
import Bill from 'app/models/bill';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { AutoComplete } from 'app/components/collection/AutoComplete';

import VendorSelection from './VendorSelection';
import IntParcelVendorSelect from './IntParcelVendorSelect';
import VendorCountriesSelection from './VendorCountriesSelection';
import VendorWeightAdjustment from '../components/VendorWeightAdjustment';

const { Title } = Typography;

const billDescriptionDataSource = getDataSource(FETCHER_KEY.BILL_DESCRIPTION);

interface Props {
  billValidator: BillValidator;
  vendors: Vendor[];
  isFetchingVendors: boolean;
  vendorCountries: string[];
  isFetchingVendorCountries: boolean;
  onVendorSelectionChanged: (vendorId: string | undefined) => void;
  userRole: Role;
  bill: Bill;
}
const PackageInfo = ({
  billValidator,
  vendors,
  isFetchingVendors,
  vendorCountries,
  isFetchingVendorCountries,
  onVendorSelectionChanged,
  userRole,
  bill,
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

      <Form.Item label="Trọng lượng (kg)" required>
        <Input.Group compact>
          <Form.Item name="weightInKg" rules={billValidator.weightInKg} noStyle>
            <InputNumber precision={2} min={0} />
          </Form.Item>
          {!isEmpty(bill.id) &&
            [Role.ADMIN, Role.ACCOUNTANT].includes(userRole) && (
              <VendorWeightAdjustment bill={bill} />
            )}
        </Input.Group>
      </Form.Item>

      <Form.Item
        name="internationalParcelVendor"
        label="Dịch vụ"
        rules={billValidator.internationalParcelVendor}
      >
        <IntParcelVendorSelect />
      </Form.Item>

      <Form.Item
        name="destinationCountry"
        label="Nước đến"
        rules={billValidator.destinationCountry}
      >
        <VendorCountriesSelection
          countries={vendorCountries}
          loading={isFetchingVendorCountries}
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
