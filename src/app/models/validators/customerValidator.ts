import { Rule } from 'antd/lib/form';
import isEmpty from 'lodash/fp/isEmpty';
import toLower from 'lodash/fp/toLower';
import toUpper from 'lodash/fp/toUpper';

import CustomerFetcher from 'app/fetchers/customerFetcher';

const customerFetcher = new CustomerFetcher();

const isValidCustomerCode = (id?: string) => async (
  _rule,
  value,
): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `Code.ToLower() == "${toLower(value)}" `;

  if (id && !isEmpty(id)) {
    query = `${query} and Id != "${id}"`;
  }

  const count = await customerFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject(`${toUpper(value)} đã có`);
  }

  return Promise.resolve();
};

const isValidPhone = (id?: string) => async (_rule, value): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `Phone.ToLower() == "${toLower(value)}" `;

  if (id && !isEmpty(id)) {
    query = `${query} and Id != "${id}"`;
  }

  const count = await customerFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject('Có khách hàng đã sử dụng số điện thoại này');
  }

  return Promise.resolve();
};

type ZoneValidator = {
  code: Rule[];
  name: Rule[];
  phone: Rule[];
  address: Rule[];
};
const getCustomerValidator = (id?: string): ZoneValidator => ({
  code: [
    { required: true, message: 'Chưa nhập Mã khách hàng' },
    {
      validator: isValidCustomerCode(id),
      validateTrigger: 'onFinish',
    },
  ],
  name: [{ required: true, message: 'Chưa nhập Tên khách hàng' }],
  phone: [
    { required: true, message: 'Chưa nhập Số điện thoại' },
    { pattern: new RegExp('^[0-9]*$'), message: 'Số điện thoại không đúng!' },
    {
      validator: isValidPhone(id),
      validateTrigger: 'onFinish',
    },
  ],
  address: [{ required: true, message: 'Chưa nhập Địa chỉ' }],
});

export default getCustomerValidator;
