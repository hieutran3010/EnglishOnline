import ModelBase from './modelBase';

export default class Customer extends ModelBase {
  code!: string;
  name!: string;
  nickName?: string;
  phone!: string;
  address!: string;
  hint?: string;
  saleUserId?: string;
}
