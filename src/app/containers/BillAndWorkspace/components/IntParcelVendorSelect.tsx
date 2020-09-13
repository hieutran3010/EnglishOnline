import React, { memo, useMemo } from 'react';
import Select, { SelectProps } from 'antd/lib/select';
import { PARCEL_VENDOR } from 'app/models/bill';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import some from 'lodash/fp/some';
import Zone from 'app/models/zone';
import { ZONE_VENDOR_ASSOCIATION_SEPARATOR } from 'app/containers/VendorAndService/constants';

const { Option } = Select;
interface Props {
  services?: string[];
  relatedzones?: Zone[];
}
const IntParcelVendorSelect = React.forwardRef(
  (props: SelectProps<any> & Props, ref: any) => {
    const { services, relatedzones } = props;

    const options = useMemo(() => {
      let filteredServices = [
        PARCEL_VENDOR.DHL_SING as string,
        PARCEL_VENDOR.DHL_VN as string,
        PARCEL_VENDOR.UPS as string,
        PARCEL_VENDOR.FEDEX as string,
        PARCEL_VENDOR.TNT as string,
      ];

      if (!isEmpty(services)) {
        const customServices = filter(
          (s: string) => !filteredServices.includes(s),
        )(services);
        if (!isEmpty(customServices)) {
          filteredServices.push(...customServices);
        }
      }

      if (
        relatedzones &&
        !isEmpty(relatedzones) &&
        !some((z: Zone) => !z.name.includes(ZONE_VENDOR_ASSOCIATION_SEPARATOR))(
          relatedzones,
        ) &&
        services &&
        !isEmpty(services)
      ) {
        // only has service zones
        filteredServices = filter((s: string) =>
          some((z: Zone) => z.name.includes(s))(relatedzones),
        )(services);
      }

      return map((s: string) => {
        return (
          <Option key={s} value={s}>
            {s}
          </Option>
        );
      })(filteredServices);
    }, [relatedzones, services]);

    return (
      <Select ref={ref} size="small" {...props}>
        {options}
      </Select>
    );
  },
);
export default memo(IntParcelVendorSelect);
