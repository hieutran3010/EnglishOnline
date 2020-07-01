import { v4 as uuidV4 } from 'uuid';

export default class VendorQuotation {
  id: string;
  startWeight?: number;
  endWeight!: number;
  zonePrices: VendorQuotationPrice[];
  /**
   *
   */
  constructor() {
    this.id = uuidV4();
    this.zonePrices = [];
  }
}

export class VendorQuotationPrice {
  zoneId!: string;
  priceInUsd?: number;
}
