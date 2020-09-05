import toLower from 'lodash/fp/toLower';
import isEmpty from 'lodash/fp/isEmpty';
import { Rule } from 'antd/lib/form';

import ParcelServiceFetcher from 'app/fetchers/parcelServiceFetcher';

const parcelServiceFetcher = new ParcelServiceFetcher();

const isValidParcelServiceName = (serviceId?: string) => async (
  _rule,
  value,
): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `Name.ToLower() == "${toLower(value)}"`;
  if (serviceId && !isEmpty(serviceId)) {
    query = `${query} and Id != "${serviceId}"`;
  }
  const count = await parcelServiceFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject('Tên dịch vụ này đã có');
  }

  return Promise.resolve();
};

type ParcelServiceValidator = {
  name: Rule[];
};
const getParcelServiceValidator = (
  serviceId?: string,
): ParcelServiceValidator => ({
  name: [
    { required: true, message: 'Chưa nhập tên dịch vụ' },
    {
      validator: isValidParcelServiceName(serviceId),
      validateTrigger: 'onFinish',
    },
  ],
});

export default getParcelServiceValidator;
