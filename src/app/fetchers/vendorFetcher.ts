import { GraphQLFetcherBase } from './base';
import Vendor, {
  QuotationReport,
  QuotationReportParams,
  ServiceAssignmentResult,
} from 'app/models/vendor';
import type VendorQuotation from 'app/models/vendorQuotation';

export default class VendorFetcher extends GraphQLFetcherBase<Vendor> {
  selectFields: string[] = [
    'id',
    'name',
    'officeAddress',
    'phone',
    'otherFeeInUsd',
    'fuelChargePercent',
    'isStopped',
  ];

  constructor() {
    super('Vendor', () => this.selectFields);
  }

  updateQuotation = (vendorQuotations: VendorQuotation[], vendorId: string) => {
    return this.executeCustomMutationAsync(
      'updateQuotation',
      { vendorId, vendorQuotations },
      { input: 'VendorQuotationUpdateInput!' },
    );
  };

  assignParcelServices = (
    selectedServiceIds: string[],
    vendorId: string,
  ): Promise<ServiceAssignmentResult> => {
    return this.executeAsync<ServiceAssignmentResult>(
      'assignParcelServices',
      `mutation($serviceIds: [GUID!], $vendorId: GUID!) {
        vendor {
          assignParcelServices(serviceIds: $serviceIds, vendorId: $vendorId) {
            newZones {
              id
              name
              countries
              vendorId
            }
            deletedZoneIds
          }
        }
      }`,
      { serviceIds: selectedServiceIds, vendorId },
    );
  };

  getQuotationReport = (
    queryParams: QuotationReportParams,
  ): Promise<QuotationReport[]> => {
    return this.executeAsync<QuotationReport[]>(
      'getQuotationReport',
      `query($queryParams: QuotationReportParams!) {
        vendor {
          getQuotationReport(queryParams: $queryParams) {
            vendorName
            quotation {
              zone
              service
              purchasePriceInUsd
              purchasePriceInVnd
              purchasePriceAfterVatInUsd
              purchasePriceAfterVatInVnd
            }
          }
        }
      }`,
      { queryParams },
    );
  };
}
