import ModelBase from './modelBase';

export default class SaleQuotationRate extends ModelBase {
  fromWeight!: number;
  toWeight?: number;
  percent!: number;
}
