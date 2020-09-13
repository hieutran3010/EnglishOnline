import React, { memo, useCallback, useMemo } from 'react';
import { Select } from 'antd';
import map from 'lodash/fp/map';
import { SelectProps } from 'antd/lib/select';
import uniqueId from 'lodash/fp/uniqueId';
import { uniq } from 'lodash';

const { Option } = Select;

interface Props {
  countries: string[];
}
const VendorCountriesSelection = React.forwardRef(
  ({ countries, ...restProps }: Props & SelectProps<any>, ref: any) => {
    const onFilter = useCallback(
      (input, option: any) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      [],
    );

    const countryOptions = useMemo(() => {
      const uniqueCountries = uniq(countries);
      return map((country: string) => (
        <Option key={uniqueId('c')} value={country}>
          {country}
        </Option>
      ))(uniqueCountries);
    }, [countries]);

    return (
      <Select
        ref={ref}
        showSearch
        optionFilterProp="children"
        filterOption={onFilter}
        {...restProps}
      >
        {countryOptions}
      </Select>
    );
  },
);

export default memo(VendorCountriesSelection);
