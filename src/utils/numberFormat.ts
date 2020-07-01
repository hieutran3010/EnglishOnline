import toString from 'lodash/fp/toString';

const toCurrency = (value: number, isUsd: boolean = false) => {
  const formatted = toString(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (isUsd === true) {
    return `$${formatted}`;
  }

  return `${formatted}đ`;
};

export { toCurrency };
