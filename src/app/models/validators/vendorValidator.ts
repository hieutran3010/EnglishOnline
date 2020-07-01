import toLower from 'lodash/fp/toLower';
import isEmpty from 'lodash/fp/isEmpty';
import { Rule } from 'antd/lib/form';

import VendorFetcher from 'app/fetchers/vendorFetcher';

const vendorFetcher = new VendorFetcher();

const isValidVendorName = (vendorId?: string) => async (
  _rule,
  value,
): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `Name.ToLower() == "${toLower(value)}"`;
  if (vendorId && !isEmpty(vendorId)) {
    query = `${query} and Id != "${vendorId}"`;
  }
  const count = await vendorFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject('Tên nhà cung cấp này đã có');
  }

  return Promise.resolve();
};

type VendorValidator = {
  name: Rule[];
  otherFeeInUsd: Rule[];
  fuelChargePercent: Rule[];
  phone: Rule[];
};
const getZoneValidator = (vendorId?: string): VendorValidator => ({
  name: [
    { required: true, message: 'Chưa nhập tên nhà cung cấp' },
    {
      validator: isValidVendorName(vendorId),
      validateTrigger: 'onFinish',
    },
  ],
  otherFeeInUsd: [{ required: true, message: 'Chưa nhập Phí khác' }],
  fuelChargePercent: [{ required: true, message: 'Chưa nhập Phí nhiên liệu' }],
  phone: [
    { pattern: new RegExp('^[0-9]*$'), message: 'Số điện thoại không đúng!' },
  ],
});

export default getZoneValidator;
