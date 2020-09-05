import React, { useState, useCallback, useMemo } from 'react';
import { AutoComplete } from 'antd';
import { AutoCompleteProps } from 'antd/lib/auto-complete';
import isEmpty from 'lodash/fp/isEmpty';
import uniqueId from 'lodash/fp/uniqueId';
import find from 'lodash/fp/find';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import size from 'lodash/fp/size';
import head from 'lodash/fp/head';

import {
  IDataSource,
  QueryOperator,
  QueryParams,
  QueryCriteria,
} from '../types';

const { Option } = AutoComplete;

const getQueryParams = (
  searchKey: string,
  searchPropNames: string[],
  pageSize?: number,
): QueryParams => {
  if (!searchKey || isEmpty(searchKey)) {
    // get first page
    return {
      pageSize,
      page: 1,
    };
  }

  let criteria: QueryCriteria[] = [];
  searchPropNames.forEach((propName: string) => {
    criteria.push({
      field: propName,
      operator: QueryOperator.C,
      value: searchKey,
    });
  });

  return { criteria };
};

interface Props {
  fetchDataSource: IDataSource;
  minSearchLength: number;
  searchPropNames: string[];
  valuePath: string;
  onSelected?: (item: any) => void;
  displayPath: string;
  itemRender?: (item: any) => React.Component;
  pageSize?: number;
  excludeValue?: any;
  excludePath?: string;
}
const DefaultAutoComplete = React.forwardRef(
  (
    {
      fetchDataSource,
      minSearchLength,
      searchPropNames,
      onSelected,
      displayPath,
      valuePath,
      itemRender,
      pageSize,
      excludeValue,
      excludePath,
      ...restProps
    }: Props & AutoCompleteProps,
    ref: any,
  ) => {
    const [items, setItems] = useState<any[]>();
    const [isFetchedFirstTime, setIsFetchedFirstTime] = useState(false);

    const fetchData = useCallback(
      async (searchKey: string) => {
        const queryParams = getQueryParams(
          searchKey,
          searchPropNames,
          pageSize,
        );

        const data = await fetchDataSource.queryManyAsync(queryParams, true);
        if (!isEmpty(data)) {
          setItems(data);
          if (size(data) === 1) {
            onSelected && onSelected(head(data));
          }
        } else {
          setItems([]);
        }
      },
      [fetchDataSource, onSelected, pageSize, searchPropNames],
    );

    const onSearchChange = useCallback(
      (value: string) => {
        if (isEmpty(value)) {
          fetchData('');
          return;
        }

        if (value.length < minSearchLength) {
          return;
        }

        fetchData(value);
      },
      [fetchData, minSearchLength],
    );

    const onInternalSelected = useCallback(
      (_value, option) => {
        if (onSelected) {
          const { key } = option;
          const item = find(set(valuePath, key)({}))(items);
          onSelected(item);
        }
      },
      [items, onSelected, valuePath],
    );

    const onDropdownVisibleChanged = useCallback(
      (open: boolean) => {
        if (open === true && isEmpty(items) && !isFetchedFirstTime) {
          fetchData('');
          setIsFetchedFirstTime(true);
        }
      },
      [fetchData, isFetchedFirstTime, items],
    );

    const source = useMemo(() => {
      let filteredItems = items;
      if (
        excludePath &&
        !isEmpty(excludePath) &&
        excludeValue &&
        !isEmpty(excludeValue)
      ) {
        filteredItems = filter(
          (item: any) => get(excludePath)(item) !== excludeValue,
        )(items);
      }

      return map((item: any) => (
        <Option
          key={get(valuePath)(item) || uniqueId('ac_')}
          value={get(valuePath)(item) || item}
          text={get(displayPath)(item) || item}
        >
          {(itemRender && itemRender(item)) || get(displayPath)(item) || item}
        </Option>
      ))(filteredItems);
    }, [displayPath, excludeValue, itemRender, items, valuePath, excludePath]);

    return (
      <AutoComplete
        ref={ref}
        onSearch={onSearchChange}
        onSelect={onInternalSelected}
        onDropdownVisibleChange={onDropdownVisibleChanged}
        {...restProps}
      >
        {source}
      </AutoComplete>
    );
  },
);

DefaultAutoComplete.defaultProps = {
  minSearchLength: 2,
  valuePath: 'id',
  pageSize: 20,
};

export default DefaultAutoComplete;
