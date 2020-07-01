import { call, put, takeLatest, select } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import forEach from 'lodash/fp/forEach';
import isEmpty from 'lodash/fp/isEmpty';
import filter from 'lodash/fp/filter';
import toNumber from 'lodash/fp/toNumber';
import findIndex from 'lodash/fp/findIndex';
import find from 'lodash/fp/find';
import orderBy from 'lodash/fp/orderBy';

import { PayloadAction } from '@reduxjs/toolkit';
import VendorFetcher from 'app/fetchers/vendorFetcher';
import VendorQuotation, {
  VendorQuotationPrice,
} from 'app/models/vendorQuotation';
import type Vendor from 'app/models/vendor';
import type Zone from 'app/models/zone';

import { actions } from './slice';
import { selectVendor } from './selectors';

const vendorFetcher = new VendorFetcher();
vendorFetcher.selectFields = [
  ...vendorFetcher.selectFields,
  'vendorQuotations {id startWeight endWeight zonePrices {zoneId priceInUsd}}',
  'zones {id name countries}',
];

export function* fetchVendorTask(action: PayloadAction<string>) {
  yield put(actions.indicateIsFetchingVendor(true));

  const vendorId = action.payload;
  const vendor = yield call(vendorFetcher.queryOneAsync, {
    query: `Id = "${vendorId}"`,
    include: 'Zones',
  });

  yield put(actions.fetchVendorCompleted(vendor));

  yield put(actions.indicateIsFetchingVendor(false));
}

export function* submitDataTask(action: PayloadAction<any[]>) {
  yield put(actions.setIsSubmittingData(true));

  try {
    let currentVendor = (yield select(selectVendor)) as Vendor;

    const quotations = yield call(cookSheetData, action.payload, currentVendor);
    yield call(vendorFetcher.updateQuotation, quotations, currentVendor.id);
    yield call(toast.success, 'Đã lưu dữ liệu');
    yield put(actions.setSubmitErrorState(false));
  } catch (error) {
    yield put(actions.setSubmitErrorState(true));
  }

  yield put(actions.setIsSubmittingData(false));
}

export function cookSheetData(
  dataRows: any[],
  vendor: Vendor,
): VendorQuotation[] {
  const result: VendorQuotation[] = [];

  // cache zone row, countries row is the first, zone row is the second => zoneRowIndex = 1
  const zoneRow = [...dataRows[1]];

  const validRows = filter((cells: any) => {
    const cell = find(
      (cell: any) => cell.row && cell.row >= 2 && !isEmpty(cell.value),
    )(cells);
    return cell;
  })(dataRows);

  // remove two header rows(zone and countries)
  const { zones } = vendor;
  const orderedZones = orderBy('name', ['asc'], zones);

  forEach((dataRow: any) => {
    const vendorQuotation = new VendorQuotation();

    var weight = getWeightValue(dataRow[0]);
    if (!isEmpty(weight)) {
      vendorQuotation.startWeight = weight.startWeight;
      vendorQuotation.endWeight = weight.endWeight || 0;

      // create price by zone
      const zonePrices: VendorQuotationPrice[] = [];
      forEach((zone: Zone) => {
        const { id, name } = zone;

        const zoneColIndex = findIndex((col: any) => col.value === name)(
          zoneRow,
        );
        const price = toNumber(dataRow[zoneColIndex + 1].value); // the first col is weight

        const zonePrice = new VendorQuotationPrice();
        zonePrice.zoneId = id;
        zonePrice.priceInUsd = price;

        zonePrices.push(zonePrice);
      })(orderedZones);

      vendorQuotation.zonePrices = zonePrices;
      result.push(vendorQuotation);
    }
  })(validRows);

  return result;
}

export function getWeightValue(weightCol: any) {
  const { value } = weightCol;
  if (value.includes('-')) {
    const rangeValues: string[] = filter(w => !isEmpty(w))(
      value.split('-'),
    ) as string[];

    if (rangeValues.length === 0) {
      return {};
    }

    return {
      startWeight: toNumber(rangeValues[0].trim()),
      endWeight: toNumber(rangeValues[1].trim()),
    };
  }

  if (isEmpty(value)) {
    return {};
  }

  return {
    startWeight: undefined,
    endWeight: toNumber(value.trim()),
  };
}

export function* vendorQuotationDetailSaga() {
  yield takeLatest(actions.fetchVendor.type, fetchVendorTask);
  yield takeLatest(actions.submitData.type, submitDataTask);
}
