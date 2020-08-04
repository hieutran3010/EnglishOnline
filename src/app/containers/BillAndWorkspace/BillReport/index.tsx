/**
 *
 * BillReport
 *
 */

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { isEmpty } from 'lodash';
import {
  DatePicker,
  Button,
  Form,
  Radio,
  Space,
  Spin,
  Popover,
  Descriptions,
} from 'antd';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import getDataSource, { FETCHER_KEY } from 'app/collection-datasource';
import { authStorage, authorizeHelper } from 'app/services/auth';
import { Role } from 'app/models/user';
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
  selectTotalProfitBeforeTax,
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
} from './selectors';
import BillList from '../components/BillList';
import BillStatistic, { BillStatisticProps } from './BillStatistic';
import VendorGroupingTable from './VendorGroupingTable';
import SenderGroupingTable from './SenderGroupingTable';
import { getDefaultReportQueryCriteria, getAdminCols } from './utils';
import { EXPORT_SESSION_STATUS } from 'app/models/exportSession';

const { RangePicker } = DatePicker;

enum BillListType {
  Normal = 1,
  GroupByVendor,
  GroupByCustomer,
}

interface Props {}
export const BillReport = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: billReportSaga });
  const dispatch = useDispatch();
  const [filterForm] = Form.useForm();

  const [isReset, setIsReset] = useState(true);
  const [adminBillListType, setAdminBillListType] = useState(
    BillListType.Normal,
  );
  const [dateRange, setDateRange] = useState<any[]>([]);

  const user = authStorage.getUser();

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
  const totalProfitBeforeTax = useSelector(selectTotalProfitBeforeTax);
  const isFetchingTotalProfit = useSelector(selectIsFetchingTotalProfit);

  const isFetchingBillsVendorGrouping = useSelector(
    selectIsFetchingVendorGroupingList,
  );
  const billsVendorGrouping = useSelector(selectBillsGroupedByVendor);

  const isFetchingBillsCustomerGrouping = useSelector(
    selectIsFetchingCustomerGroupingList,
  );
  const billsCustomerGrouping = useSelector(selectBillsGroupedByCustomer);

  const checkingExportSession = useSelector(selectCheckingExportSession);
  const billExportStatus = useSelector(selectBillExportStatus);
  const exportSession = useSelector(selectExportSession);

  useEffect(() => {
    return function cleanUp() {
      dispatch(actions.reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user.role === Role.ADMIN) {
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

  const getQuery = useCallback(
    (dateRange: any[]) => {
      const criteria: QueryCriteria[] = getDefaultReportQueryCriteria(
        dateRange,
      );

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
    },
    [user.id, user.role],
  );

  const billDataSource = useMemo(() => {
    const billDataSource = getDataSource(FETCHER_KEY.BILL);
    billDataSource.orderByFields = 'date descending';
    billDataSource.query = getQuery([]);

    return billDataSource;
  }, [getQuery]);

  useEffect(() => {
    if (adminBillListType !== BillListType.Normal) {
      const query = getQuery(dateRange);
      refreshBillList(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminBillListType]);

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
      }
    },
    [adminBillListType, billDataSource, dispatch],
  );

  const onSubmitReport = useCallback(
    filter => {
      const { dateRange } = filter;
      setDateRange(dateRange || []);
      const query = getQuery(dateRange);
      refreshBillList(query);
      setIsReset(false);

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
          break;
        }
        case Role.ACCOUNTANT: {
          dispatch(actions.fetchCustomerDebt(query));
          dispatch(actions.fetchVendorDebt(query));
          break;
        }
      }
    },
    [dispatch, getQuery, refreshBillList, user.role],
  );

  const onAdminBillListTypeChanged = useCallback(e => {
    setAdminBillListType(e.target.value);
  }, []);

  const onExportBills = useCallback(async () => {
    await filterForm.validateFields();
    const latestDateRange = filterForm.getFieldValue('dateRange');
    const query = getQuery(latestDateRange);
    dispatch(
      actions.requestBillExport({
        query,
        note: `Báo cáo từ ngày ${latestDateRange[0].format(
          'DD-MM-YYYY',
        )} đến ngày ${latestDateRange[1].format('DD-MM-YYYY')}`,
      }),
    );
  }, [dispatch, filterForm, getQuery]);

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
    totalProfitBeforeTax,
    totalVendorDebt,
    isFetchingTotalVendorDebt,
  };

  const filterValidator = useMemo(() => {
    return {
      dateRange: [
        { required: true, message: 'Chưa chọn thời điểm Báo cáo' },
        {
          validator: (_rule, value) => {
            if (isEmpty(value)) {
              return Promise.resolve();
            }

            const [fromDate, toDate] = value;
            if (fromDate.month() !== toDate.month()) {
              return Promise.reject(
                'Thời điểm báo cáo phải nằm trong cùng 1 tháng',
              );
            }

            return Promise.resolve();
          },
          validateTrigger: 'onFinish',
        },
      ],
    };
  }, []);

  return (
    <RootContainer
      title="Báo Cáo"
      subTitle="Chỉ thống kê những Bill không bị hủy"
      tags={
        <Form form={filterForm} layout="inline" onFinish={onSubmitReport}>
          <Form.Item name="dateRange" rules={filterValidator.dateRange}>
            <RangePicker
              ranges={{
                'Tháng trước': [
                  moment().subtract(1, 'months').startOf('month'),
                  moment().subtract(1, 'months').endOf('month'),
                ],
                'Tháng này': [
                  moment().startOf('month'),
                  moment().endOf('month'),
                ],
              }}
              format="DD-MM-YYYY"
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
            </Space>
          </Form.Item>
        </Form>
      }
    >
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
        <BillStatistic {...billStatisticProps} />
      </div>
      {authorizeHelper.canRenderWithRole(
        [Role.ADMIN],
        <Radio.Group
          style={{ marginLeft: 20, marginBottom: 10 }}
          onChange={onAdminBillListTypeChanged}
          options={[
            { label: 'Danh sách Bill', value: BillListType.Normal },
            {
              label: 'Nhóm theo Nhà cung cấp',
              value: BillListType.GroupByVendor,
            },
            {
              label: 'Nhóm theo Khách Gởi',
              value: BillListType.GroupByCustomer,
            },
          ]}
          optionType="button"
          buttonStyle="solid"
          value={adminBillListType}
        />,
      )}
      {(adminBillListType === BillListType.Normal || isReset) && (
        <BillList
          billDataSource={billDataSource}
          isReset={isReset}
          excludeFields={['isArchived']}
          extendCols={getAdminCols()}
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
    </RootContainer>
  );
});
