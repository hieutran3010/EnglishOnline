/**
 *
 * BillReport
 *
 */

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import {
  DatePicker,
  Button,
  Form,
  Space,
  Spin,
  Popover,
  Descriptions,
  Alert,
  Typography,
  Tag,
} from 'antd';

import isEmpty from 'lodash/fp/isEmpty';
import isUndefined from 'lodash/fp/isUndefined';
import isNil from 'lodash/fp/isNil';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { authStorage, authorizeHelper } from 'app/services/auth';
import User, { Role } from 'app/models/user';
import { QueryCriteria } from 'app/components/collection/types';
import { GRAPHQL_QUERY_OPERATOR } from 'app/collection-datasource/graphql/constants';
import { parseQueryCriteriaToGraphQLDoorQuery } from 'app/collection-datasource/graphql/utils';
import { RootContainer } from 'app/components/Layout';

import { reducer, sliceKey, actions } from './slice';
import { billReportSaga } from './saga';
import {
  selectTotalSalePriceOfSale,
  selectIsFetchingTotalSalePrice,
  selectTotalRevenue,
  selectIsFetchingTotalRevenue,
  selectTotalCustomerDebt,
  selectIsFetchingTotalCustomerDebt,
  selectTotalProfit,
  selectIsFetchingTotalProfit,
  selectTotalVendorDebt,
  selectIsFetchingTotalVendorDebt,
  selectIsFetchingVendorGroupingList,
  selectBillsGroupedByVendor,
  selectIsFetchingCustomerGroupingList,
  selectBillsGroupedByCustomer,
  selectCheckingExportSession,
  selectBillExportStatus,
  selectExportSession,
  selectIsFetchingTotalBillCount,
  selectTotalBillCount,
  selectTotalRawProfit,
  selectTotalRawProfitBeforeTax,
  selectIsFetchingTotalRawProfit,
  selectTotalFinalBill,
  selectIsFetchingTotalFinalBill,
  selectDateRange,
  selectIsFetchingTotalCustomerPayment,
  selectTotalCustomerPayment,
  selectBillsGroupedBySale,
  selectIsFetchingSaleGroupingList,
} from './selectors';
import BillList from '../components/BillList';
import BillStatistic, { BillStatisticProps } from './components/BillStatistic';
import VendorGroupingTable from './components/VendorGroupingTable';
import SenderGroupingTable from './components/SenderGroupingTable';
import { getDefaultReportQueryCriteria, getAdminCols } from './utils';
import { EXPORT_SESSION_STATUS } from 'app/models/exportSession';
import { useBillView } from '../BillViewPage/hook';
import { BillListType } from './types';
import AdminTools from './components/AdminTools';
import SaleGroupingTable from './components/SaleGroupingTable';

const { Text } = Typography;

const getQuery = (user: User, dateRange: any[]) => {
  const criteria: QueryCriteria[] = getDefaultReportQueryCriteria(dateRange);

  switch (user.role) {
    case Role.SALE: {
      criteria.push({
        field: 'SaleUserId',
        operator: GRAPHQL_QUERY_OPERATOR.EQUALS,
        value: user.id,
      });
      break;
    }
    case Role.LICENSE: {
      criteria.push({
        field: 'LicenseUserId',
        operator: GRAPHQL_QUERY_OPERATOR.EQUALS,
        value: user.id,
      });
    }
  }

  return parseQueryCriteriaToGraphQLDoorQuery(criteria);
};

interface Props {}
export const BillReport = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: billReportSaga });
  useBillView();

  const dispatch = useDispatch();
  const [filterForm] = Form.useForm();

  const [isReset, setIsReset] = useState(true);
  const [adminBillListType, setAdminBillListType] = useState(
    BillListType.Normal,
  );
  const [isFilterError, setIsFilterError] = useState(false);

  const user = authStorage.getUser();

  const dateRange = useSelector(selectDateRange);

  const totalSalePrice = useSelector(selectTotalSalePriceOfSale);
  const isFetchingTotalSalePrice = useSelector(selectIsFetchingTotalSalePrice);

  const totalRevenue = useSelector(selectTotalRevenue);
  const isFetchingTotalRevenue = useSelector(selectIsFetchingTotalRevenue);

  const totalCustomerDebt = useSelector(selectTotalCustomerDebt);
  const isFetchingTotalCustomerDebt = useSelector(
    selectIsFetchingTotalCustomerDebt,
  );

  const totalVendorDebt = useSelector(selectTotalVendorDebt);
  const isFetchingTotalVendorDebt = useSelector(
    selectIsFetchingTotalVendorDebt,
  );

  const totalProfit = useSelector(selectTotalProfit);
  const isFetchingTotalProfit = useSelector(selectIsFetchingTotalProfit);

  const totalRawProfit = useSelector(selectTotalRawProfit);
  const totalRawProfitBeforeTax = useSelector(selectTotalRawProfitBeforeTax);
  const isFetchingTotalRawProfit = useSelector(selectIsFetchingTotalRawProfit);

  const totalBillCount = useSelector(selectTotalBillCount);
  const isFetchingTotalBillCount = useSelector(selectIsFetchingTotalBillCount);

  const totalFinalBill = useSelector(selectTotalFinalBill);
  const isFetchingTotalFinalBill = useSelector(selectIsFetchingTotalFinalBill);

  const isFetchingBillsVendorGrouping = useSelector(
    selectIsFetchingVendorGroupingList,
  );
  const billsVendorGrouping = useSelector(selectBillsGroupedByVendor);

  const isFetchingBillsCustomerGrouping = useSelector(
    selectIsFetchingCustomerGroupingList,
  );
  const billsCustomerGrouping = useSelector(selectBillsGroupedByCustomer);

  const isFetchingBillsSaleGrouping = useSelector(
    selectIsFetchingSaleGroupingList,
  );
  const billsSaleGrouping = useSelector(selectBillsGroupedBySale);

  const isFetchingTotalCustomerPayment = useSelector(
    selectIsFetchingTotalCustomerPayment,
  );
  const totalCustomerPayment = useSelector(selectTotalCustomerPayment);

  const checkingExportSession = useSelector(selectCheckingExportSession);
  const billExportStatus = useSelector(selectBillExportStatus);
  const exportSession = useSelector(selectExportSession);

  useEffect(() => {
    return function cleanUp() {
      dispatch(actions.reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user.role === Role.ADMIN || user.role === Role.ACCOUNTANT) {
      dispatch(actions.checkExportSession(user.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let counter;
    if (billExportStatus === EXPORT_SESSION_STATUS.WORKING) {
      counter = setInterval(() => {
        dispatch(actions.checkExportSession(user.id));
      }, 3000);
    } else if (billExportStatus === EXPORT_SESSION_STATUS.DONE && counter) {
      clearInterval(counter);
    }

    return function cleanUp() {
      if (counter) {
        clearInterval(counter);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billExportStatus]);

  const billDataSource = useMemo(() => {
    const billDataSource = getDataSource(FETCHER_KEY.BILL);
    billDataSource.orderByFields = 'date descending';
    billDataSource.query = getQuery(user, dateRange);

    return billDataSource;
  }, [dateRange, user]);

  useEffect(() => {
    if (isEmpty(dateRange)) {
      setIsReset(true);
    } else {
      filterForm.setFieldsValue({
        fromDate: dateRange[0],
        toDate: dateRange[1],
      });
      const query = getQuery(user, dateRange);
      refreshBillList(query);
      loadStatistic(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  useEffect(() => {
    if (
      adminBillListType !== BillListType.Normal &&
      (isEmpty(billsVendorGrouping) || isEmpty(billsCustomerGrouping))
    ) {
      const query = getQuery(user, dateRange);
      refreshBillList(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminBillListType]);

  const getFilter = useCallback(() => {
    const { fromDate, toDate } = filterForm.getFieldsValue();
    if (isNil(toDate)) {
      return [fromDate, moment()];
    }

    return [fromDate, toDate];
  }, [filterForm]);

  const refreshBillList = useCallback(
    (query: string) => {
      switch (adminBillListType) {
        case BillListType.Normal: {
          billDataSource.query = query;
          billDataSource.onReloadData();
          break;
        }
        case BillListType.GroupByVendor: {
          dispatch(actions.fetchBillsGroupedByVendor(query));
          break;
        }
        case BillListType.GroupByCustomer: {
          dispatch(actions.fetchBillsGroupedByCustomer(query));
          break;
        }
        case BillListType.GroupBySales: {
          dispatch(actions.fetchBillsGroupedBySale(query));
          break;
        }
      }
    },
    [adminBillListType, billDataSource, dispatch],
  );

  const loadStatistic = useCallback(
    (query: string) => {
      setIsReset(false);

      dispatch(actions.fetchTotalBillCount(query));

      switch (user.role) {
        case Role.SALE: {
          dispatch(actions.fetchTotalSalePrice(query));
          break;
        }
        case Role.ADMIN: {
          dispatch(actions.fetchTotalRevenue(query));
          dispatch(actions.fetchCustomerDebt(query));
          dispatch(actions.fetchVendorDebt(query));
          dispatch(actions.fetchProfit(query));
          dispatch(actions.fetchRawProfit(query));
          dispatch(actions.fetchTotalFinalBill(query));
          dispatch(actions.fetchTotalCustomerPayment(query));
          break;
        }
        case Role.ACCOUNTANT: {
          dispatch(actions.fetchCustomerDebt(query));
          dispatch(actions.fetchVendorDebt(query));
          dispatch(actions.fetchTotalFinalBill(query));
          break;
        }
      }
    },
    [dispatch, user],
  );

  const onSubmitReport = useCallback(() => {
    setIsFilterError(false);

    const _dateRange = getFilter();

    dispatch(actions.setDateRange(_dateRange));
  }, [dispatch, getFilter]);

  const onAdminBillListTypeChanged = useCallback(
    (billListType: BillListType) => {
      setAdminBillListType(billListType);
    },
    [],
  );

  const onExportBills = useCallback(async () => {
    try {
      await filterForm.validateFields();
    } catch (error) {
      setIsFilterError(true);
      return;
    }

    setIsFilterError(false);
    const _dateRange = getFilter();
    const query = getQuery(user, _dateRange);
    dispatch(
      actions.requestBillExport({
        query,
        note: `Báo cáo từ ngày ${_dateRange[0].format(
          'DD-MM-YYYY',
        )} đến ngày ${_dateRange[1].format('DD-MM-YYYY')}`,
      }),
    );
  }, [dispatch, filterForm, getFilter, user]);

  const onDownloadBill = useCallback(() => {
    dispatch(actions.downloadBills());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const billStatisticProps: BillStatisticProps = {
    isFetchingTotalSalePrice,
    totalSalePrice,
    totalRevenue,
    isFetchingTotalRevenue,
    totalCustomerDebt,
    isFetchingTotalCustomerDebt,
    isFetchingTotalProfit,
    totalProfit,
    totalVendorDebt,
    isFetchingTotalVendorDebt,
    totalBillCount,
    isFetchingTotalBillCount,
    isFetchingTotalRawProfit,
    totalRawProfit,
    totalRawProfitBeforeTax,
    isFetchingTotalCustomerPayment,
    totalCustomerPayment,
  };

  const filterValidator = useMemo(() => {
    return {
      fromDate: [{ required: true }],
    };
  }, []);

  const disabledToDate = useCallback(current => {
    const fromDate = filterForm.getFieldValue('fromDate');
    return fromDate && current < moment(fromDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterChanged = useCallback((_changeValues, allValues) => {
    const { fromDate } = allValues;
    if (isEmpty(fromDate) || isUndefined(fromDate) || isNil(fromDate)) {
      filterForm.setFieldsValue({ toDate: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitReportFailed = useCallback(() => {
    setIsFilterError(true);
  }, []);

  return (
    <RootContainer
      title="Báo Cáo"
      subTitle="Chỉ thống kê những Bill không bị hủy"
      tags={
        <Form
          form={filterForm}
          layout="inline"
          onFinish={onSubmitReport}
          onValuesChange={onFilterChanged}
          onFinishFailed={onSubmitReportFailed}
        >
          <Form.Item name="fromDate" rules={filterValidator.fromDate} noStyle>
            <DatePicker format="DD-MM-YYYY" placeholder="Từ ngày" />
          </Form.Item>
          <Form.Item name="toDate" style={{ marginLeft: 15 }}>
            <DatePicker
              format="DD-MM-YYYY"
              placeholder="Tới ngày"
              disabledDate={disabledToDate}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                OK
              </Button>
              {authorizeHelper.canRenderWithRole(
                [Role.ADMIN, Role.ACCOUNTANT],
                <>
                  {!billExportStatus && (
                    <Button
                      htmlType="button"
                      loading={checkingExportSession}
                      onClick={onExportBills}
                    >
                      Tải danh sách Bill
                    </Button>
                  )}

                  {billExportStatus === EXPORT_SESSION_STATUS.DONE && (
                    <>
                      <Popover
                        title="Thông tin lượt tải"
                        placement="bottom"
                        content={
                          <Descriptions
                            size="small"
                            style={{ width: 400 }}
                            column={1}
                          >
                            <Descriptions.Item label="Thời điểm yêu cầu tải">
                              {moment(exportSession?.createdOn).format(
                                'DD-MM-YYYY HH:MM',
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chú Thích">
                              {exportSession?.note}
                            </Descriptions.Item>
                          </Descriptions>
                        }
                      >
                        <Button
                          htmlType="button"
                          type="link"
                          onClick={onDownloadBill}
                        >
                          Bấm vào đây để tải về danh sách bill
                        </Button>
                      </Popover>
                      <span>hoặc</span>
                      <Button
                        htmlType="button"
                        type="link"
                        onClick={onExportBills}
                      >
                        Tải lại
                      </Button>
                    </>
                  )}

                  {billExportStatus === EXPORT_SESSION_STATUS.WORKING && (
                    <>
                      <Spin size="small" />
                      <span>Đang chuẩn bị danh sách Bill tải về...</span>
                    </>
                  )}
                </>,
              )}
              {isFilterError && (
                <Alert
                  type="error"
                  message="Nhập ngày bắt đầu để xem hoặc tải"
                  style={{ paddingTop: 4, paddingBottom: 4 }}
                />
              )}
            </Space>
          </Form.Item>
        </Form>
      }
    >
      <div
        style={{
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 20,
          overflow: 'auto',
        }}
      >
        <BillStatistic {...billStatisticProps} />
      </div>

      {authorizeHelper.canRenderWithRole(
        [Role.ADMIN],
        <AdminTools
          style={{ marginLeft: 20, marginBottom: 10 }}
          onBillListTypeChanged={onAdminBillListTypeChanged}
          billListType={adminBillListType}
        />,
      )}
      {!isEmpty(dateRange) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          <Text strong>{`Báo cáo từ ${dateRange[0].format(
            'DD-MM-YYYY 00:00',
          )} đến ${dateRange[1].format('DD-MM-YYYY 23:59')}`}</Text>
          {authorizeHelper.canRenderWithRole(
            [Role.ACCOUNTANT],
            <Space>
              {isFetchingTotalFinalBill ? (
                <Spin size="small" />
              ) : (
                <Tag color="#2db7f5" style={{ marginRight: 0 }}>
                  {totalFinalBill}
                </Tag>
              )}
              <Text>bill đã chốt</Text>
            </Space>,
          )}
        </div>
      )}

      {(adminBillListType === BillListType.Normal || isReset) && (
        <BillList
          billDataSource={billDataSource}
          isReset={isReset}
          excludeFields={['isArchived', 'billDeliveryHistories']}
          extendCols={getAdminCols()}
          heightOffset={user.role === Role.ADMIN ? 0.51 : 0.47}
        />
      )}

      {adminBillListType === BillListType.GroupByVendor && !isReset && (
        <VendorGroupingTable
          loading={isFetchingBillsVendorGrouping}
          dataSource={billsVendorGrouping}
          dateRange={dateRange}
        />
      )}

      {adminBillListType === BillListType.GroupByCustomer && !isReset && (
        <SenderGroupingTable
          loading={isFetchingBillsCustomerGrouping}
          dataSource={billsCustomerGrouping}
          dateRange={dateRange}
        />
      )}

      {adminBillListType === BillListType.GroupBySales && !isReset && (
        <SaleGroupingTable
          loading={isFetchingBillsSaleGrouping}
          dataSource={billsSaleGrouping}
          dateRange={dateRange}
        />
      )}
    </RootContainer>
  );
});
