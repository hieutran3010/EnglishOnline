import isEmpty from 'lodash/fp/isEmpty';
import isNil from 'lodash/fp/isNil';
import map from 'lodash/fp/map';
import { GraphQLEntityFetcher } from 'graphql-door-client';
import { Subject } from 'rxjs';
import {
  IDataSource,
  QueryParams,
  QueryCriteria as CollectionControlQueryCriteria,
  QueryOperator,
  OrderOption,
} from 'app/components/collection/types';
import { GRAPHQL_QUERY_OPERATOR } from './constants';
import { parseQueryCriteriaToGraphQLDoorQuery } from './utils';
import { QueryCriteria } from '../types';

export default class GraphQLDataSource<TModel> implements IDataSource {
  onReloaded = new Subject();

  includeField?: string;

  orderByFields?: string;

  query?: string;
  fetcher: GraphQLEntityFetcher<TModel>;

  constructor(fetcher: GraphQLEntityFetcher<TModel>) {
    this.fetcher = fetcher;
  }

  queryManyAsync = (
    queryParams: QueryParams,
    isSearchOr?: boolean,
  ): Promise<any[]> => {
    const { order, pageSize, page, criteria } = queryParams;
    const query = this.getGraphQLQuery(criteria || [], isSearchOr);

    return this.fetcher.queryManyAsync({
      query,
      include: this.includeField,
      orderBy: this.getOrderConfig(order || {}) || this.orderByFields,
      pageSize,
      page,
    });
  };

  countAsync = (
    queryCriteria: CollectionControlQueryCriteria[],
  ): Promise<number> => {
    const query = this.getGraphQLQuery(queryCriteria);
    return this.fetcher.countAsync(query);
  };

  addAsync = (model: any): Promise<any> => this.fetcher.addAsync(model);

  onReloadData = () => {
    this.onReloaded.next();
  };

  /**
   * Convert the query criteria from collection-control to query that is able to work with GraphQL
   * @param queryCriteria The query criteria that is received from collection control
   */
  private convertToGraphQLQueryCriteria = (
    queryCriteria: CollectionControlQueryCriteria[],
  ): QueryCriteria[] => {
    let result: QueryCriteria[] = [];
    if (queryCriteria && !isEmpty(queryCriteria)) {
      result = map(
        (criteria: CollectionControlQueryCriteria): QueryCriteria => {
          return {
            field: criteria.field,
            value: criteria.value,
            operator: this.convertToGraphQLOperator(criteria.operator),
          };
        },
      )(queryCriteria);
    }
    return result;
  };

  /**
   * Convert the query criteria from collection-control to query that is able to work with GraphQL, then merge with static query
   * @param queryCriteria The query criteria that is received from collection control
   */
  private getGraphQLQuery = (
    queryCriteria: CollectionControlQueryCriteria[],
    isSearchOr?: boolean,
  ): string => {
    let graphQLQueryCriteria = this.convertToGraphQLQueryCriteria(
      queryCriteria,
    );
    const graphqlQueries: string[] = [];
    const graphqlQueryItem = parseQueryCriteriaToGraphQLDoorQuery(
      graphQLQueryCriteria,
      isSearchOr,
    );

    if (!isEmpty(graphqlQueryItem)) {
      graphqlQueries.push(graphqlQueryItem);
    }

    if (this.query && !isEmpty(this.query) && !isNil(this.query)) {
      graphqlQueries.push(this.query);
    }

    return graphqlQueries.join(isSearchOr ? '||' : '&&');
  };

  /**
   * Convert the collection control operator to graphql operator
   * @param controlOperator The collection control operator
   */
  private convertToGraphQLOperator = (controlOperator: string): string => {
    switch (controlOperator) {
      case QueryOperator.C: {
        return GRAPHQL_QUERY_OPERATOR.CONTAINS;
      }
      case QueryOperator.E: {
        return GRAPHQL_QUERY_OPERATOR.EQUALS;
      }
      case QueryOperator.NE:
      case QueryOperator.GT:
      case QueryOperator.GTE:
      case QueryOperator.LT:
      case QueryOperator.LTE: {
        return controlOperator;
      }
      case QueryOperator.ANY_TRUE: {
        return GRAPHQL_QUERY_OPERATOR.ANY_TRUE;
      }
      case QueryOperator.ANY_FALSE: {
        return GRAPHQL_QUERY_OPERATOR.ANY_FALSE;
      }
      default: {
        return GRAPHQL_QUERY_OPERATOR.CONTAINS;
      }
    }
  };

  private getOrderConfig = (controlOrder: OrderOption): string => {
    const { orderByField, isDescending } = controlOrder;

    if (!orderByField || isEmpty(orderByField)) {
      return '';
    }

    let result = orderByField;
    if (isDescending === true) {
      result = `${result} descending`;
    }

    return result;
  };
}
