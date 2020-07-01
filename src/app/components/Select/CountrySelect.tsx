import React, { useMemo, memo } from 'react';
import { Select } from 'antd';
import map from 'lodash/fp/map';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';
import isNil from 'lodash/fp/isNil';
import isUndefined from 'lodash/fp/isUndefined';
import { SelectProps } from 'antd/lib/select';

const countryData = require('./country.json');

const { Option } = Select;

interface ExcludedCountry {
  country?: string;
  reason?: string;
}
interface Props {
  excludeCountries?: ExcludedCountry[];
}
const CountrySelect = React.forwardRef(
  ({ excludeCountries, ...restProps }: Props & SelectProps<any>, ref: any) => {
    const { value } = restProps;

    const options = useMemo(() => {
      return map((country: any) => {
        const { code, name } = country;
        const c = `${name} - ${code}`;

        let excludedCountry: ExcludedCountry = {};
        if (!isEmpty(excludeCountries)) {
          excludedCountry = find((item: ExcludedCountry) => c === item.country)(
            excludeCountries,
          ) as ExcludedCountry;
        }
        const isDisabled =
          !isEmpty(excludedCountry) &&
          !isNil(excludedCountry) &&
          !isUndefined(excludedCountry);

        const isSelectedCountry = value && !isEmpty(value) && value.includes(c);

        return (
          <Option
            key={code}
            value={c}
            disabled={isDisabled === true && !isSelectedCountry}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{c}</span>
              <span>{isDisabled === true ? excludedCountry.reason : ''}</span>
            </div>
          </Option>
        );
      })(countryData);
    }, [excludeCountries, value]);

    return (
      <Select
        ref={ref}
        mode="multiple"
        style={{ width: '100%' }}
        optionLabelProp="label"
        allowClear
        {...restProps}
      >
        {options}
      </Select>
    );
  },
);

export default memo(CountrySelect);
export type { ExcludedCountry };
