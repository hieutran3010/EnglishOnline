import { GraphQLFetcherBase } from './base';
import ExportSession from 'app/models/exportSession';

export default class ExportSessionFetcher extends GraphQLFetcherBase<
  ExportSession
> {
  selectFields: string[] = [
    'id',
    'userId',
    'createdOn',
    'status',
    'exportType',
    'filePath',
    'note',
  ];

  constructor() {
    super('ExportSession', () => this.selectFields);
  }
}
