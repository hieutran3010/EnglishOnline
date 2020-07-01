import { Subject } from 'rxjs';

export interface IDataSource {
  queryManyAsync: (params: QueryParams, isSearchOr?: boolean) => Promise<any[]>;
  countAsync: (queryCriteria: QueryCriteria[]) => Promise<number>;
  onReloaded: Subject<any>;
  addAsync: (model: any) => Promise<any>;
  onReloadData: () => void;
}

export interface QueryParams {
  pageSize?: number;
  page?: number;
  order?: OrderOption;
  criteria?: QueryCriteria[];
}

export interface QueryCriteria {
  field: string;
  value: any;
  operator: string;
}

export const QueryOperator = {
  E: '=',
  NE: '!=',
  GT: '>',
  GTE: '>=',
  LT: '<',
  LTE: '<=',
  C: 'contains',
  ANY_TRUE: 'any',
  ANY_FALSE: '!any',
};

export interface OrderOption {
  orderByField?: string;
  isDescending?: boolean;
}
