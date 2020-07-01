import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from './slice';
import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher from 'app/fetchers/billFetcher';
import { MathResult } from 'graphql-door-client/lib/types';
import { VendorStatistic, CustomerStatistic } from 'app/models/bill';
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

export function* fetchCustomerDebtTask(action: PayloadAction<string>) {
  const query = action.payload;
  const result = yield call(billFetcher.sumAsync, 'CustomerPaymentDebt', query);
  yield put(actions.fetchCustomerDebtCompleted(result.value));
}

export function* fetchVendorDebtTask(action: PayloadAction<string>) {
  const query = action.payload;
  const result = yield call(billFetcher.sumAsync, 'VendorPaymentDebt', query);
  yield put(actions.fetchVendorDebtCompleted(result.value));
}

export function* fetchProfitTask(action: PayloadAction<string>) {
  const query = action.payload;
  const profit = yield call(billFetcher.sumAsync, 'Profit', query);
  const profitBeforeTax = yield call(
    billFetcher.sumAsync,
    'ProfitBeforeTax',
    query,
  );
  yield put(
    actions.fetchProfitCompleted({
      totalProfit: profit.value,
      totalProfitBeforeTax: profitBeforeTax.value,
    }),
  );
}

export function* fetchBillsGroupedByVendorTask(action: PayloadAction<string>) {
  const query = action.payload;

  let result: VendorStatistic[] = [];
  try {
    result = yield call(billFetcher.getVendorStatistic, query);
  } catch (error) {
    //TODO: should log here
  }

  yield put(actions.fetchBillsGroupedByVendorCompleted(result || []));
} //TODO: should log here

export function* fetchBillsGroupedByCustomerTask(
  action: PayloadAction<string>,
) {
  const query = action.payload;

  let result: CustomerStatistic[] = [];
  try {
    result = yield call(billFetcher.getCustomerStatistic, query);
  } catch (error) {
    //TODO: should log here
  }

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
    //TODO: should log here
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
  } catch (error) {
    // TODO: should log here
  }

  yield put(actions.checkExportSessionCompleted(session));
}

export function* downloadBillsTask() {
  const exportSession = (yield select(selectExportSession)) as ExportSession;
  if (exportSession && exportSession.filePath) {
    yield call(exportFetcher.downloadBillReport, exportSession.filePath);
  }
}

export async function getRevenue(query: string): Promise<MathResult> {
  let result: MathResult;
  try {
    result = await billFetcher.sumAsync('SalePrice', query);
  } catch (error) {
    //TODO: should log here
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
  yield takeLatest(
    actions.fetchBillsGroupedByVendor.type,
    fetchBillsGroupedByVendorTask,
  );
  yield takeLatest(
    actions.fetchBillsGroupedByCustomer.type,
    fetchBillsGroupedByCustomerTask,
  );
  yield takeLatest(actions.requestBillExport.type, requestBillExportTask);
  yield takeLatest(actions.checkExportSession.type, checkExportSessionTask);
  yield takeLatest(actions.downloadBills.type, downloadBillsTask);
}
