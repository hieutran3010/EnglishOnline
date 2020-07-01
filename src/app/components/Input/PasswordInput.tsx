import React, { memo } from 'react';
import Input, { InputProps } from 'antd/lib/input';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';

const PasswordInput = React.forwardRef((props: InputProps, ref: any) => {
  return (
    <Input.Password
      ref={ref}
      iconRender={visible =>
        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
      }
      {...props}
    />
  );
});

export default memo(PasswordInput);
