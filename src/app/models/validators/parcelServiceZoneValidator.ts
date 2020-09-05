import { Rule } from 'antd/lib/form';
import isEmpty from 'lodash/fp/isEmpty';
import toLower from 'lodash/fp/toLower';
import toUpper from 'lodash/fp/toUpper';

import { ParcelServiceZoneFetcher } from 'app/fetchers/parcelServiceFetcher';
import { ZONE_VENDOR_ASSOCIATION_SEPARATOR } from 'app/containers/VendorAndService/constants';

const parcelServiceZoneFetcher = new ParcelServiceZoneFetcher();

const isValidZoneName = (parcelServiceId: string, zoneId?: string) => async (
  _rule,
  value,
): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `Name.ToLower() == "${toLower(
    value,
  )}" and ParcelServiceId == "${parcelServiceId}"`;

  if (zoneId && !isEmpty(zoneId)) {
    query = `${query} and Id != "${zoneId}"`;
  }

  const count = await parcelServiceZoneFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject(`${toUpper(value)} đã có`);
  }

  return Promise.resolve();
};

const isAllowZoneName = (_rule, value) => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  if (value.includes(ZONE_VENDOR_ASSOCIATION_SEPARATOR)) {
    return Promise.reject(
      `Tên zone không được phép có dấu ${ZONE_VENDOR_ASSOCIATION_SEPARATOR}`,
    );
  }

  return Promise.resolve();
};

export type ParcelServiceZoneValidator = {
  name: Rule[];
  countries: Rule[];
};
const getParcelServiceZoneValidator = (
  serviceId: string,
  zoneId?: string,
): ParcelServiceZoneValidator => ({
  name: [
    { required: true, message: 'Chưa nhập tên Zone' },
    {
      validator: isValidZoneName(serviceId, zoneId),
      validateTrigger: 'onFinish',
    },
    {
      validator: isAllowZoneName,
    },
  ],
  countries: [{ required: true, message: 'Chưa chọn Quốc gia' }],
});

export default getParcelServiceZoneValidator;
