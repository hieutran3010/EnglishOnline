import { ReactElement } from 'react';
import { OrderOption, QueryCriteria } from '../types';

export interface ColumnDefinition {
  title: string;
  type?: string;
  dataIndex?: string;
  canFilter?: boolean;
  filterField?: string;
  searchOperator?: string;
  key: string;
  width?: number;
  render?: (data?: any) => ReactElement;
  sorter?: any;
  fixed?: 'left' | 'right' | true;
  editable?: boolean;
}

export interface TableChangedEventArgs {
  queryCriteria?: QueryCriteria[];
  order?: OrderOption;
  pageSize?: number;
  page?: number;
}
