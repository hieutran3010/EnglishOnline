import VendorFetcher from 'app/fetchers/vendorFetcher';
import ZoneFetcher from 'app/fetchers/zoneFetcher';
import CustomerFetcher from 'app/fetchers/customerFetcher';
import BillFetcher from 'app/fetchers/billFetcher';
import BillDescriptionFetcher from 'app/fetchers/billDescriptionFetcher';
import GraphQLDataSource from './graphql';
import ParcelServiceFetcher, {
  ParcelServiceZoneFetcher,
} from 'app/fetchers/parcelServiceFetcher';

export enum FETCHER_KEY {
  VENDOR,
  PARCEL_SERVICE,
  PARCEL_SERVICE_ZONE,
  ZONE,
  CUSTOMER,
  BILL,
  BILL_DESCRIPTION,
}

const getDataSource = (fetcherKey: FETCHER_KEY, extendFields?: string[]) => {
  switch (fetcherKey) {
    case FETCHER_KEY.VENDOR: {
      return new GraphQLDataSource(new VendorFetcher());
    }
    case FETCHER_KEY.PARCEL_SERVICE: {
      return new GraphQLDataSource(new ParcelServiceFetcher());
    }
    case FETCHER_KEY.PARCEL_SERVICE_ZONE: {
      return new GraphQLDataSource(new ParcelServiceZoneFetcher());
    }
    case FETCHER_KEY.ZONE: {
      return new GraphQLDataSource(new ZoneFetcher());
    }
    case FETCHER_KEY.CUSTOMER: {
      return new GraphQLDataSource(new CustomerFetcher());
    }
    case FETCHER_KEY.BILL: {
      return new GraphQLDataSource(new BillFetcher(extendFields));
    }
    case FETCHER_KEY.BILL_DESCRIPTION: {
      return new GraphQLDataSource(new BillDescriptionFetcher());
    }
  }
};

export default getDataSource;
