import ModelBase from './modelBase';

export default class Customer extends ModelBase {
  code!: string;
  name!: string;
  phone!: string;
  address!: string;
  hint?: string;
}
