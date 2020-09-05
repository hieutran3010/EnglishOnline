import { GraphQLFetcherBase } from './base';
import ParcelService, {
  ParcelServiceZone,
  ParcelServiceVendor,
} from 'app/models/parcelService';
import { isEmpty } from 'lodash';

const getParcelServiceField = (extendFields?: string[]) => {
  const selectFields: string[] = ['id', 'name', 'isSystem'];

  if (extendFields && !isEmpty(extendFields)) {
    return selectFields.concat(extendFields);
  }

  return selectFields;
};
export default class ParcelServiceFetcher extends GraphQLFetcherBase<
  ParcelService
> {
  selectFields: string[] = ['id', 'name', 'isSystem'];

  constructor(extendFields?: string[]) {
    super('ParcelService', () => getParcelServiceField(extendFields));
  }
}

export class ParcelServiceZoneFetcher extends GraphQLFetcherBase<
  ParcelServiceZone
> {
  selectFields: string[] = ['id', 'name', 'countries', 'parcelServiceId'];

  constructor() {
    super('ParcelServiceZone', () => this.selectFields);
  }
}

const getParcelServiceVendorField = (extendFields?: string[]) => {
  const selectFields: string[] = ['id', 'vendorId', 'parcelServiceId'];

  if (extendFields && !isEmpty(extendFields)) {
    return selectFields.concat(extendFields);
  }

  return selectFields;
};

export class ParcelServiceVendorFetcher extends GraphQLFetcherBase<
  ParcelServiceVendor
> {
  constructor(extendFields?: string[]) {
    super('ParcelServiceVendor', () =>
      getParcelServiceVendorField(extendFields),
    );
  }
}
