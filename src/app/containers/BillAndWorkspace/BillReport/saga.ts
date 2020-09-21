import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { actions } from './slice';
import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher from 'app/fetchers/billFetcher';
import { MathResult } from 'graphql-door-client/lib/types';
import {
  VendorStatistic,
  CustomerStatistic,
  BILL_STATUS,
  PAYMENT_TYPE,
} from 'app/models/bill';
import ExportSessionFetcher from 'app/fetchers/exportSessionFetcher';
import ExportFetcher from 'app/fetchers/exportFetcher';
import { toast } from 'react-toastify';
import ExportSession, { EXPORT_TYPE } from 'app/models/exportSession';
import { selectExportSession } from './selectors';

const billFetcher = new BillFetcher();
const exportSessionFetcher = new ExportSessionFetcher();
const exportFetcher = new ExportFetcher();

export function* fetchTotalSalePriceTask(action: PayloadAction<string>) {
  const query = action.payload;
  const result = yield call(getRevenue, query);
  yield put(actions.fetchTotalSalePriceCompleted(result.value));
}

export function* fetchTotalRevenueTask(action: PayloadAction<string>) {
  const query = action.payload;
  const result = yield call(getRevenue, query);
  yield put(actions.fetchTotalRevenueCompleted(result.value));
}

export function* fetchTotalCustomerPayment(action: PayloadAction<string>) {
  const query = action.payload;

  const [
    total,
    totalCash,
    totalBankTransfer,
    totalOtherBankTransfer,
  ] = yield all([
    call(
      billFetcher.sumAsync,
      'CustomerPaymentAmount,OtherCustomerPaymentAmount',
      '(CustomerPaymentAmount ?? 0) + (OtherCustomerPaymentAmount ?? 0)',
      query,
    ),
    call(
      billFetcher.sumAsync,
      'CustomerPaymentAmount',
      'CustomerPaymentAmount',
      `${query} and (CustomerPaymentType = "${PAYMENT_TYPE.CASH}" or CustomerPaymentType = "${PAYMENT_TYPE.CASH_AND_BANK_TRANSFER}")`,
    ),
    call(
      billFetcher.sumAsync,
      'CustomerPaymentAmount',
      'CustomerPaymentAmount',
      `${query} and CustomerPaymentType = "${PAYMENT_TYPE.BANK_TRANSFER}"`,
    ),
    call(
      billFetcher.sumAsync,
      'OtherCustomerPaymentAmount',
      'OtherCustomerPaymentAmount',
      `${query} and CustomerPaymentType = "${PAYMENT_TYPE.CASH_AND_BANK_TRANSFER}"`,
    ),
  ]);

  yield put(
    actions.fetchTotalCustomerPaymentCompleted({
      total: total.value,
      totalCash: totalCash.value,
      totalBankTransfer: totalBankTransfer.value + totalOtherBankTransfer.value,
    }),
  );
}

export function* fetchCustomerDebtTask(action: PayloadAction<string>) {
  const query = action.payload;
  const result = yield call(
    billFetcher.sumAsync,
    'CustomerPaymentDebt',
    'CustomerPaymentDebt',
    query,
  );
  yield put(actions.fetchCustomerDebtCompleted(result.value));
}

export function* fetchVendorDebtTask(action: PayloadAction<string>) {
  const query = action.payload;
  const result = yield call(
    billFetcher.sumAsync,
    'VendorPaymentDebt',
    'VendorPaymentDebt',
    query,
  );
  yield put(actions.fetchVendorDebtCompleted(result.value));
}

export function* fetchProfitTask(action: PayloadAction<string>) {
  const query = action.payload;
  const profit = yield call(billFetcher.sumAsync, 'Profit', 'Profit', query);
  yield put(actions.fetchProfitCompleted(profit.value));
}

export function* fetchRawProfitTask(action: PayloadAction<string>) {
  const query = action.payload;
  const rawProfit = yield call(
    billFetcher.sumAsync,
    'SalePrice,PurchasePriceAfterVatInVnd',
    '(SalePrice ?? 0) - (PurchasePriceAfterVatInVnd ?? 0)',
    query,
  );
  const rawProfitBeforeTax = yield call(
    billFetcher.sumAsync,
    'SalePrice,PurchasePriceInVnd',
    '(SalePrice ?? 0) - (PurchasePriceInVnd ?? 0)',
    query,
  );
  yield put(
    actions.fetchRawProfitCompleted({
      totalRawProfit: rawProfit.value,
      totalRawProfitBeforeTax: rawProfitBeforeTax.value,
    }),
  );
}

export function* fetchTotalBillCountTask(action: PayloadAction<string>) {
  const query = action.payload;
  const totalBillCount = yield call(billFetcher.countAsync, query);
  yield put(actions.fetchTotalBillCountCompleted(totalBillCount));
}

export function* fetchTotalFinalBillTask(action: PayloadAction<string>) {
  const query = action.payload;
  const totalFinalBillCount = yield call(
    billFetcher.countAsync,
    `${query} && Status = "${BILL_STATUS.DONE}"`,
  );
  yield put(actions.fetchTotalFinalBillCompleted(totalFinalBillCount));
}

export function* fetchBillsGroupedByVendorTask(action: PayloadAction<string>) {
  const query = action.payload;

  let result: VendorStatistic[] = [];
  try {
    result = yield call(billFetcher.getVendorStatistic, query);
  } catch (error) {}

  yield put(actions.fetchBillsGroupedByVendorCompleted(result || []));
}

export function* fetchBillsGroupedByCustomerTask(
  action: PayloadAction<string>,
) {
  const query = action.payload;

  let result: CustomerStatistic[] = [];
  try {
    result = yield call(billFetcher.getCustomerStatistic, query);
  } catch (error) {}

  yield put(actions.fetchBillsGroupedByCustomerCompleted(result || []));
}

export function* requestBillExportTask(
  action: PayloadAction<{ query: string; note: string }>,
) {
  let sessionId: string = '';
  try {
    sessionId = yield call(
      exportFetcher.requestExportBillReport,
      action.payload.query,
      action.payload.note,
    );
  } catch (error) {
    yield call(toast.error, 'Chưa tải được bill, vui lòng thử lại...');
  }
  yield put(actions.requestBillExportCompleted(sessionId));
}

export function* checkExportSessionTask(action: PayloadAction<string>) {
  const userId = action.payload;
  let session: ExportSession | undefined = undefined;
  try {
    session = yield call(exportSessionFetcher.queryOneAsync, {
      query: `UserId = "${userId}" and ExportType = "${EXPORT_TYPE.BILL_REPORT}"`,
    });
  } catch (error) {}

  yield put(actions.checkExportSessionCompleted(session));
}

export function* downloadBillsTask() {
  const exportSession = (yield select(selectExportSession)) as ExportSession;
  if (exportSession && exportSession.filePath) {
    try {
      yield call(exportFetcher.downloadBillReport, exportSession.filePath);
      yield put(actions.requestBillExportCompleted(''));
    } catch (error) {
      yield call(toast.error, 'Chưa tải được, vui lòng thử lại');
    }
  }
}

export async function getRevenue(query: string): Promise<MathResult> {
  let result: MathResult;
  try {
    result = await billFetcher.sumAsync('SalePrice', 'SalePrice', query);
  } catch (error) {
    result = { value: 0 };
  }

  return result;
}

export function* billReportSaga() {
  yield takeLatest(actions.fetchTotalSalePrice.type, fetchTotalSalePriceTask);
  yield takeLatest(actions.fetchTotalRevenue.type, fetchTotalRevenueTask);
  yield takeLatest(actions.fetchCustomerDebt.type, fetchCustomerDebtTask);
  yield takeLatest(actions.fetchVendorDebt.type, fetchVendorDebtTask);
  yield takeLatest(actions.fetchProfit.type, fetchProfitTask);
  yield takeLatest(actions.fetchRawProfit.type, fetchRawProfitTask);
  yield takeLatest(actions.fetchTotalBillCount.type, fetchTotalBillCountTask);
  yield takeLatest(actions.fetchTotalFinalBill.type, fetchTotalFinalBillTask);
  yield takeLatest(
    actions.fetchBillsGroupedByVendor.type,
    fetchBillsGroupedByVendorTask,
  );
  yield takeLatest(
    actions.fetchBillsGroupedByCustomer.type,
    fetchBillsGroupedByCustomerTask,
  );
  yield takeLatest(
    actions.fetchTotalCustomerPayment.type,
    fetchTotalCustomerPayment,
  );
  yield takeLatest(actions.requestBillExport.type, requestBillExportTask);
  yield takeLatest(actions.checkExportSession.type, checkExportSessionTask);
  yield takeLatest(actions.downloadBills.type, downloadBillsTask);
}
