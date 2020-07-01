import ModelBase from './modelBase';

export enum APP_PARAM_KEY {
  VAT = 'VAT',
  USD_EXCHANGE_RATE = 'USD_EXCHANGE_RATE',
}

export default class AppParam extends ModelBase {
  key?: string;
  value?: any;
}

export class BillParams {
  vat?: number;
  usdExchangeRate?: number;
}
