import React, { memo } from 'react';
import capitalize from 'lodash/fp/capitalize';
import Select, { SelectProps } from 'antd/lib/select';
import { PARCEL_VENDOR } from 'app/models/bill';

const { Option } = Select;
const IntParcelVendorSelect = React.forwardRef(
  (props: SelectProps<any>, ref: any) => {
    return (
      <Select ref={ref} size="small" {...props}>
        <Option key={1} value={PARCEL_VENDOR.DHL_VN}>
          {PARCEL_VENDOR.DHL_VN}
        </Option>
        <Option key={2} value={PARCEL_VENDOR.DHL_SING}>
          {PARCEL_VENDOR.DHL_SING}
        </Option>
        <Option key={3} value={PARCEL_VENDOR.UPS}>
          {PARCEL_VENDOR.UPS}
        </Option>
        <Option key={4} value={PARCEL_VENDOR.TNT}>
          {PARCEL_VENDOR.TNT}
        </Option>
        <Option key={5} value={PARCEL_VENDOR.FEDEX}>
          {capitalize(PARCEL_VENDOR.FEDEX)}
        </Option>
      </Select>
    );
  },
);
export default memo(IntParcelVendorSelect);
