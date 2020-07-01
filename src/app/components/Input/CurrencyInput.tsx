import React, { memo } from 'react';
import { InputNumber } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';

const CurrencyInput = React.forwardRef((props: InputNumberProps, ref: any) => {
  return (
    <InputNumber
      ref={ref}
      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
      style={{ width: '100%' }}
      {...props}
    />
  );
});

export default memo(CurrencyInput);
