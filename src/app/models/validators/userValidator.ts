import { Rule } from 'antd/lib/form';
import { REGEX_PATTERN } from 'utils/numberFormat';

type UserValidator = {
  email: Rule[];
  password: Rule[];
  name: Rule[];
  phoneNumber: Rule[];
  role: Rule[];
};
const getUserValidator = (): UserValidator => ({
  email: [
    { required: true, message: 'Chưa nhập Email' },
    { type: 'email', message: 'Email không đúng' },
  ],
  password: [{ required: true, message: 'Chưa nhập Mật khẩu' }],
  name: [{ required: true, message: 'Chưa nhập Tên người dùng' }],
  phoneNumber: [
    {
      pattern: new RegExp(REGEX_PATTERN.PHONE),
      message: 'Số điện thoại chỉ cho phép các ký số từ 1 tới 9',
    },
  ],
  role: [{ required: true, message: 'Chưa chọn quyền' }],
});

interface LoginValidator {
  email: Rule[];
  password: Rule[];
}
export const getLoginValidator = (): LoginValidator => ({
  email: [
    { required: true, message: 'Chưa nhập Email' },
    { type: 'email', message: 'Email không đúng' },
  ],
  password: [{ required: true, message: 'Chưa nhập Mật khẩu' }],
});

export default getUserValidator;
