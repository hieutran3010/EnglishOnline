import isEmpty from 'lodash/fp/isEmpty';
import toLower from 'lodash/fp/toLower';
import { GRAPHQL_QUERY_OPERATOR } from './constants';
import { QueryCriteria } from '../types';

const formatCriteriaValue = (criteria: QueryCriteria) => {
  const { value, isExplicitFilter } = criteria;

  if (isExplicitFilter && typeof value !== 'string') {
    return value;
  }

  if (typeof value === 'string') {
    return `"${isExplicitFilter ? value : toLower(value)}"`;
  }
  return value;
};

export const parseQueryCriteriaToGraphQLDoorQuery = (
  queryCriteria: QueryCriteria[],
  isSearchOr?: boolean,
) => {
  if (!isEmpty(queryCriteria)) {
    const parsedFilters = queryCriteria.map((criteria: QueryCriteria) => {
      const { field, operator, value } = criteria;

      switch (operator) {
        case GRAPHQL_QUERY_OPERATOR.CONTAINS:
          return `${field}.ToLower().Contains(${formatCriteriaValue(
            criteria,
          )})`;
        case GRAPHQL_QUERY_OPERATOR.EQUALS:
        case GRAPHQL_QUERY_OPERATOR.NOT_EQUAL:
        case GRAPHQL_QUERY_OPERATOR.GT:
        case GRAPHQL_QUERY_OPERATOR.GTE:
        case GRAPHQL_QUERY_OPERATOR.LT:
        case GRAPHQL_QUERY_OPERATOR.LTE:
          return `${field} ${operator} ${formatCriteriaValue(criteria)}`;
        case GRAPHQL_QUERY_OPERATOR.ANY_FALSE:
          return `!${field}.Any(s => s.${value})`;
        case GRAPHQL_QUERY_OPERATOR.ANY_TRUE:
          return `${field}.Any(s => s.${value})`;
        default:
          return '';
      }
    });

    return parsedFilters.join(isSearchOr ? ' || ' : ' && ');
  }

  return '';
};
