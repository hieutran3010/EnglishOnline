import React, { memo } from 'react';
import Select, { SelectProps } from 'antd/lib/select';
import { PAYMENT_TYPE } from 'app/models/bill';

interface Props {
  isBothType?: boolean;
}
const { Option } = Select;
const PaymentSelect = React.forwardRef(
  ({ isBothType, ...restProps }: SelectProps<any> & Props, ref: any) => {
    return (
      <Select ref={ref} size="small" {...restProps}>
        <Option key={1} value={PAYMENT_TYPE.CASH}>
          Tiền mặt
        </Option>
        <Option key={2} value={PAYMENT_TYPE.BANK_TRANSFER}>
          Chuyển khoản
        </Option>
        {isBothType && (
          <Option key={3} value={PAYMENT_TYPE.CASH_AND_BANK_TRANSFER}>
            Tiền mặt & Chuyển khoản
          </Option>
        )}
      </Select>
    );
  },
);
export default memo(PaymentSelect);
