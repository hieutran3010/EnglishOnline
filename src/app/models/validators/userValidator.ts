import { Rule } from 'antd/lib/form';

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
    { pattern: new RegExp('^[0-9]*$'), message: 'Số điện thoại không đúng!' },
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
