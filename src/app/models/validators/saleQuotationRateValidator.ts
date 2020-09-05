import { Rule } from 'antd/lib/form';
import { isNil, isUndefined, max, size } from 'lodash';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import findIndex from 'lodash/fp/findIndex';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import SaleQuotationRate from '../saleQuotationRate';

const isValidFromWeight = (
  currentSaleRates: SaleQuotationRate[],
  editingSaleRate?: SaleQuotationRate,
) => async (_rule, value): Promise<void> => {
  if (isEmpty(currentSaleRates) || isNil(value) || isUndefined(value)) {
    return Promise.resolve();
  }

  const { id } = editingSaleRate || {};
  const existedFromWeight = find(
    (sr: SaleQuotationRate) => sr.fromWeight === value && sr.id !== id,
  )(currentSaleRates);

  if (existedFromWeight) {
    return Promise.reject('Số kg này đã có');
  }

  if (
    editingSaleRate &&
    editingSaleRate.toWeight &&
    value >= editingSaleRate.toWeight
  ) {
    return Promise.reject(`Số kg này phải < ${editingSaleRate.toWeight}`);
  }

  if (!editingSaleRate) {
    const validToWeights = filter(
      (sr: SaleQuotationRate) =>
        !isUndefined(sr.toWeight) && !isNil(sr.toWeight),
    )(currentSaleRates);
    const toWeights = map((sr: SaleQuotationRate) => sr.toWeight)(
      validToWeights,
    );

    const maxToWeight = max(toWeights);

    if (maxToWeight && value < maxToWeight) {
      return Promise.reject(`Số kg này phải >= ${maxToWeight}`);
    }
  }

  return Promise.resolve();
};

const isValidToWeight = (
  currentSaleRates: SaleQuotationRate[],
  hasEndRange: boolean,
  editingSaleRate?: SaleQuotationRate,
) => async (_rule, value): Promise<void> => {
  if (isEmpty(currentSaleRates) && (isNil(value) || isUndefined(value))) {
    return Promise.reject('Vui lòng nhập');
  }

  if (!editingSaleRate) {
    // insert new
    if (isNil(value) || isUndefined(value)) {
      return Promise.resolve();
    }

    const validToWeights = filter(
      (sr: SaleQuotationRate) =>
        !isUndefined(sr.toWeight) && !isNil(sr.fromWeight),
    )(currentSaleRates);
    const toWeights = map((sr: SaleQuotationRate) => sr.toWeight)(
      validToWeights,
    );

    const maxToWeight = max(toWeights);

    if (maxToWeight && value < maxToWeight) {
      return Promise.reject(`Số kg này phải > ${maxToWeight}`);
    }
  } else {
    const count = size(currentSaleRates);
    if (count > 1) {
      const currentIndex = findIndex(
        (sr: SaleQuotationRate) => sr.id === editingSaleRate.id,
      )(currentSaleRates);

      if (currentIndex + 1 < count && (isNil(value) || isUndefined(value))) {
        return Promise.reject('Vui lòng nhập');
      }
      if (currentIndex < count - 1) {
        const nextRate = currentSaleRates[currentIndex + 1];
        if (value > nextRate.fromWeight) {
          return Promise.reject(`Số kg này phải <= ${nextRate.fromWeight}`);
        }
      } else if (value && value <= editingSaleRate.fromWeight) {
        return Promise.reject(
          `Số kg này phải > ${editingSaleRate.fromWeight} hoặc để trống`,
        );
      }
    }
  }

  return Promise.resolve();
};

const isValidPercent = (
  currentSaleRates: SaleQuotationRate[],
  editingSaleRate?: SaleQuotationRate,
) => async (_rule, value): Promise<void> => {
  if (isEmpty(currentSaleRates) || isNil(value) || isUndefined(value)) {
    return Promise.resolve();
  }

  const { id } = editingSaleRate || {};
  const existedPercent = find(
    (sr: SaleQuotationRate) => sr.percent === value && sr.id !== id,
  )(currentSaleRates);

  if (existedPercent) {
    return Promise.reject('% tăng này đã có');
  }

  return Promise.resolve();
};

type SaleQuotationRateValidator = {
  fromWeight: Rule[];
  toWeight: Rule[];
  percent: Rule[];
};
const getSaleQuotationRateValidator = (
  currentSaleRates: SaleQuotationRate[],
  hasEndRange: boolean,
  editingSaleRate?: SaleQuotationRate,
): SaleQuotationRateValidator => ({
  fromWeight: [
    { required: true, message: 'Vui lòng nhập' },
    {
      validator: isValidFromWeight(currentSaleRates, editingSaleRate),
    },
  ],
  toWeight: [
    {
      validator: isValidToWeight(
        currentSaleRates,
        hasEndRange,
        editingSaleRate,
      ),
    },
  ],
  percent: [
    { required: true, message: 'Chưa nhập % tăng' },
    { validator: isValidPercent(currentSaleRates, editingSaleRate) },
  ],
});

export default getSaleQuotationRateValidator;
