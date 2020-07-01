import React from 'react';
import assign from 'lodash/fp/assign';
import map from 'lodash/fp/map';
import moment from 'moment';
import { ColumnDefinition } from './types';
import { COLUMN_TYPES } from './constants';
import { getColumnSearchProps } from './SearchControls';

/**
 * Rely on Ant Table Column, add some custom field
 */
const formatColumns = (columns: ColumnDefinition[]) => {
  return map((column: ColumnDefinition) => {
    if (!column.type) {
      return column;
    }

    let formattedColumn = column;
    if (column.type === COLUMN_TYPES.DATE) {
      formattedColumn = assign({
        render: (text: Date) => (
          <span>{text ? moment(text).format('DD/MM/YYYY') : ''}</span>
        ),
      })(formattedColumn);
    }

    if (column.type === COLUMN_TYPES.DATE_TIME) {
      formattedColumn = assign({
        render: (text: Date) => (
          <span>{text ? moment(text).format('DD/MM/YYYY HH:mm') : ''}</span>
        ),
      })(formattedColumn);
    }

    if (column.type === COLUMN_TYPES.DATE_WITHOUT_YEAR) {
      formattedColumn = assign({
        render: (text: Date) => (
          <span>{text ? moment(text).format('DD/MM') : ''}</span>
        ),
      })(formattedColumn);
    }

    if (column.type === COLUMN_TYPES.CURRENCY) {
      formattedColumn = assign({
        render: (text: number) => (
          <span>
            {text ? `$ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '$ 0'}
          </span>
        ),
      })(formattedColumn);
    }

    if (column.type === COLUMN_TYPES.PERCENT) {
      formattedColumn = assign({
        render: (text: number) => <span>{text ? `${text}%` : ''}</span>,
      })(formattedColumn);
    }

    const searchableColumnTypes = [COLUMN_TYPES.STRING, COLUMN_TYPES.NUMBER];
    if (
      column.canFilter === true &&
      searchableColumnTypes.includes(column.type) &&
      column.dataIndex
    ) {
      formattedColumn = assign(getColumnSearchProps(column.dataIndex))(
        formattedColumn,
      );
    }

    return formattedColumn;
  })(columns);
};

export { formatColumns };
