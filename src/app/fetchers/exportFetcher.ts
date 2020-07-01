import { RestfulFetcherBase } from './base';
const FileDownload = require('js-file-download');

export default class ExportFetcher extends RestfulFetcherBase<any> {
  constructor() {
    super('export');
  }

  requestExportBillReport = (query: string, note: string) =>
    this.post({ query, note }, 'requestExportBillReport');

  downloadBillReport = (filePath: string) =>
    this.get('downloadBillReport', {}, { responseType: 'arraybuffer' }).then(
      response => {
        FileDownload(response, `${filePath.replace(/^.*[\\/]/, '')}.zip`);
      },
    );
}
