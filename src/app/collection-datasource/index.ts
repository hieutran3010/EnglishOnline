import VendorFetcher from 'app/fetchers/vendorFetcher';
import ZoneFetcher from 'app/fetchers/zoneFetcher';
import CustomerFetcher from 'app/fetchers/customerFetcher';
import BillFetcher from 'app/fetchers/billFetcher';
import BillDescriptionFetcher from 'app/fetchers/billDescriptionFetcher';
import GraphQLDataSource from './graphql';

export enum FETCHER_KEY {
  VENDOR,
  ZONE,
  CUSTOMER,
  BILL,
  BILL_DESCRIPTION,
}

const getDataSource = (fetcherKey: FETCHER_KEY) => {
  switch (fetcherKey) {
    case FETCHER_KEY.VENDOR: {
      return new GraphQLDataSource(new VendorFetcher());
    }
    case FETCHER_KEY.ZONE: {
      return new GraphQLDataSource(new ZoneFetcher());
    }
    case FETCHER_KEY.CUSTOMER: {
      return new GraphQLDataSource(new CustomerFetcher());
    }
    case FETCHER_KEY.BILL: {
      return new GraphQLDataSource(new BillFetcher());
    }
    case FETCHER_KEY.BILL_DESCRIPTION: {
      return new GraphQLDataSource(new BillDescriptionFetcher());
    }
  }
};

export default getDataSource;
