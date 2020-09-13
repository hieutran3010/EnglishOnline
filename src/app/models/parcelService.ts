import ModelBase from './modelBase';

export default class ParcelService extends ModelBase {
  name!: string;
  isSystem!: boolean;
}

export class ParcelServiceZone extends ModelBase {
  name!: string;
  countries!: string[];
  parcelServiceId!: string;
}

export class ParcelServiceVendor extends ModelBase {
  vendorId!: string;
  parcelServiceId!: string;
}
