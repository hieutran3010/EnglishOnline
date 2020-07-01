import React, { memo } from 'react';
import Select, { SelectProps } from 'antd/lib/select';
import { PAYMENT_TYPE } from 'app/models/bill';

const { Option } = Select;
const PaymentSelect = React.forwardRef((props: SelectProps<any>, ref: any) => {
  return (
    <Select ref={ref} size="small" {...props}>
      <Option key={1} value={PAYMENT_TYPE.CASH}>
        Tiền mặt
      </Option>
      <Option key={2} value={PAYMENT_TYPE.BANK_TRANSFER}>
        Chuyển khoản
      </Option>
    </Select>
  );
});
export default memo(PaymentSelect);
