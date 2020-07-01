import React, { memo, useCallback } from 'react';
import type Vendor from 'app/models/vendor';
import { Select } from 'antd';
import map from 'lodash/fp/map';
import { SelectProps } from 'antd/lib/select';

const { Option } = Select;

interface Props {
  vendors: Vendor[];
}
const VendorSelection = React.forwardRef(
  ({ vendors, ...restProps }: Props & SelectProps<any>, ref: any) => {
    const onFilter = useCallback(
      (input, option: any) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      [],
    );
    return (
      <Select
        ref={ref}
        showSearch
        optionFilterProp="children"
        filterOption={onFilter}
        {...restProps}
      >
        {map((vendor: Vendor) => (
          <Option key={vendor.id} value={vendor.id}>
            {vendor.name}
          </Option>
        ))(vendors)}
      </Select>
    );
  },
);

export default memo(VendorSelection);
