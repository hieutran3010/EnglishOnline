import { Rule } from 'antd/lib/form';
import isEmpty from 'lodash/fp/isEmpty';
import toLower from 'lodash/fp/toLower';
import toUpper from 'lodash/fp/toUpper';
import some from 'lodash/fp/some';

import ZoneFetcher from 'app/fetchers/zoneFetcher';
import { ZONE_VENDOR_ASSOCIATION_SEPARATOR } from 'app/containers/VendorAndService/constants';

const zoneFetcher = new ZoneFetcher();

const isValidZoneName = (vendorId: string, zoneId?: string) => async (
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

const isAllowZoneName = (serviceNames?: string[]) => (_rule, value) => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  if (value.includes(ZONE_VENDOR_ASSOCIATION_SEPARATOR)) {
    return Promise.reject(
      `Tên zone không được phép có dấu ${ZONE_VENDOR_ASSOCIATION_SEPARATOR}`,
    );
  }

  if (serviceNames && !isEmpty(serviceNames)) {
    if (some((sn: string) => value.includes(sn))(serviceNames)) {
      return Promise.reject(
        `Tên zone không được có tên của các dịch vụ: ${serviceNames.join(
          ', ',
        )}`,
      );
    }
  }

  return Promise.resolve();
};

export type ZoneValidator = {
  name: Rule[];
  countries: Rule[];
};
const getZoneValidator = (
  vendorId: string,
  zoneId?: string,
  serviceNames?: string[],
): ZoneValidator => ({
  name: [
    { required: true, message: 'Chưa nhập tên Zone' },
    {
      validator: isValidZoneName(vendorId, zoneId),
      validateTrigger: 'onFinish',
    },
    {
      validator: isAllowZoneName(serviceNames),
    },
  ],
  countries: [{ required: true, message: 'Chưa chọn Quốc gia' }],
});

export default getZoneValidator;
