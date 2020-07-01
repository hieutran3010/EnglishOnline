import ModelBase from './modelBase';

export default class Zone extends ModelBase {
  name!: string;
  countries!: string[];
  vendorId!: string;
}
