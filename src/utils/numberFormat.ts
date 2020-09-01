import toString from 'lodash/fp/toString';
import { padStart } from 'lodash';

const toCurrency = (value: number, isUsd: boolean = false) => {
  const formatted = toString(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (isUsd === true) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    });
    return formatter.format(value);
  }

  return `${formatted}đ`;
};

const toFullString = (value: number) => {
  const str = toString(value);
  if (str.length === 1) {
    return padStart(str, 2, '0');
  }
};

export { toCurrency, toFullString };
