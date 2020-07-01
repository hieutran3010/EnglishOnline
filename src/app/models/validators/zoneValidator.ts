import { Rule } from 'antd/lib/form';
import isEmpty from 'lodash/fp/isEmpty';
import toLower from 'lodash/fp/toLower';
import toUpper from 'lodash/fp/toUpper';

import ZoneFetcher from 'app/fetchers/zoneFetcher';

const zoneFetcher = new ZoneFetcher();

const isValidVendorName = (vendorId: string, zoneId?: string) => async (
  _rule,
  value,
): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `Name.ToLower() == "${toLower(
    value,
  )}" and VendorId == "${vendorId}"`;

  if (zoneId && !isEmpty(zoneId)) {
    query = `${query} and Id != "${zoneId}"`;
  }

  const count = await zoneFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject(`${toUpper(value)} đã có`);
  }

  return Promise.resolve();
};

type ZoneValidator = {
  name: Rule[];
  countries: Rule[];
};
const getZoneValidator = (
  vendorId: string,
  zoneId?: string,
): ZoneValidator => ({
  name: [
    { required: true, message: 'Chưa nhập tên Zone' },
    {
      validator: isValidVendorName(vendorId, zoneId),
      validateTrigger: 'onFinish',
    },
  ],
  countries: [{ required: true, message: 'Chưa chọn Quốc gia' }],
});

export default getZoneValidator;
