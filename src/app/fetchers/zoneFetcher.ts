import { GraphQLFetcherBase } from './base';
import type Zone from 'app/models/zone';

export default class ZoneFetcher extends GraphQLFetcherBase<Zone> {
  selectFields: string[] = ['id', 'name', 'countries', 'vendorId'];

  constructor() {
    super('Zone', () => this.selectFields);
  }

  getZoneByVendorAndCountry = (
    vendorId: string,
    destinationCountry: string,
  ): Promise<Zone> => {
    return this.executeAsync(
      'getZoneByVendorAndCountry',
      `query($vendorId: GUID!, $destinationCountry: String!) {
        zone {
          getZoneByVendorAndCountry(vendorId: $vendorId, destinationCountry: $destinationCountry) {
              id
              name
              countries
            }
        }
      }`,
      { vendorId, destinationCountry },
    );
  };
}
