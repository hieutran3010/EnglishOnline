import { Rule } from 'antd/lib/form';
import isEmpty from 'lodash/fp/isEmpty';
import toUpper from 'lodash/fp/toUpper';
import toNumber from 'lodash/fp/toNumber';

import BillFetcher from 'app/fetchers/billFetcher';

const billFetcher = new BillFetcher();

const isValidChildBillId = (id?: string) => async (
  _rule,
  value,
): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `ChildBillId = "${value}"`;

  if (id && !isEmpty(id)) {
    query = `${query} and Id != "${id}"`;
  }

  const count = await billFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject(`${toUpper(value)} đã có`);
  }

  return Promise.resolve();
};

const isValidAirlineBillId = (id?: string) => async (
  _rule,
  value,
): Promise<void> => {
  if (!value || isEmpty(value)) {
    return Promise.resolve();
  }

  let query = `AirlineBillId = "${value}"`;

  if (id && !isEmpty(id)) {
    query = `${query} and Id != "${id}"`;
  }

  const count = await billFetcher.countAsync(query);

  if (count > 0) {
    return Promise.reject(`${toUpper(value)} đã có`);
  }

  return Promise.resolve();
};

const isValidVat = (hasVat: boolean) => async (_rule, value): Promise<void> => {
  if (hasVat === true && toNumber(value) <= 0) {
    return Promise.reject('Chưa nhập % VAT');
  }

  return Promise.resolve();
};

export type BillValidator = {
  senderName: Rule[];
  senderPhone: Rule[];
  senderAddress: Rule[];
  receiverName: Rule[];
  receiverPhone: Rule[];
  receiverAddress: Rule[];
  date: Rule[];
  childBillId: Rule[];
  airlineBillId: Rule[];
  internationalParcelVendor: Rule[];
  description: Rule[];
  vendorId: Rule[];
  destinationCountry: Rule[];
  weightInKg: Rule[];
  salePrice: Rule[];
  vendorOtherFee: Rule[];
  vendorFuelChargePercent: Rule[];
  usdExchangeRate: Rule[];
  vat: Rule[];
  licenseUserId: Rule[];
  accountantUserId: Rule[];
  saleUserId: Rule[];
};
const getBillValidator = (hasVat: boolean, id?: string): BillValidator => ({
  senderName: [{ required: true, message: 'Chưa có Tên khách gởi' }],
  senderPhone: [{ required: true, message: 'Chưa có Điện thoại khách gởi' }],
  senderAddress: [{ required: true, message: 'Chưa có Địa chỉ khách gởi' }],
  receiverName: [{ required: true, message: 'Chưa có Tên khách nhận' }],
  receiverPhone: [{ required: true, message: 'Chưa có Điện thoại khách nhận' }],
  receiverAddress: [{ required: true, message: 'Chưa có Địa chỉ khách nhận' }],
  date: [{ required: true, message: 'Chưa chọn ngày lập Bill' }],
  childBillId: [
    {
      validator: isValidChildBillId(id),
      validateTrigger: 'onFinish',
    },
  ],
  airlineBillId: [
    {
      validator: isValidAirlineBillId(id),
      validateTrigger: 'onFinish',
    },
  ],
  internationalParcelVendor: [{ required: true, message: 'Chưa chọn Dịch Vụ' }],
  description: [{ required: true, message: 'Chưa nhập Loại hàng' }],
  destinationCountry: [{ required: true, message: 'Chưa chọn Quốc gia đến' }],
  vendorId: [{ required: true, message: 'Chưa chọn Nhà cung cấp' }],
  weightInKg: [{ required: true, message: 'Chưa nhập Trọng lượng hàng' }],
  salePrice: [{ required: true, message: 'Chưa nhập Giá bán' }],
  vendorOtherFee: [{ required: true, message: 'Chưa nhập Phí khác' }],
  vendorFuelChargePercent: [
    { required: true, message: 'Chưa nhập Phí nhiên liệu' },
  ],
  usdExchangeRate: [{ required: true, message: 'Chưa nhập Tỉ giá USD' }],
  vat: [
    {
      validator: isValidVat(hasVat),
    },
  ],
  licenseUserId: [{ required: true, message: 'Chưa chọn nhân viên Chứng Từ' }],
  accountantUserId: [
    { required: true, message: 'Chưa chọn nhân viên Kế Toán' },
  ],
  saleUserId: [{ required: true, message: 'Chưa chọn nhân viên Sale' }],
});

export default getBillValidator;
