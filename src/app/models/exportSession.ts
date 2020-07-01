import ModelBase from './modelBase';

export enum EXPORT_TYPE {
  BILL_REPORT = 'BILL REPORT',
}

export enum EXPORT_SESSION_STATUS {
  WORKING = 'WORKING',
  DONE = 'DONE',
}
export default class ExportSession extends ModelBase {
  userId?: string;
  createdOn?: Date;
  status: EXPORT_SESSION_STATUS;
  exportType?: EXPORT_TYPE;
  filePath?: string;
  note!: string;

  /**
   *
   */
  constructor() {
    super();
    this.status = EXPORT_SESSION_STATUS.WORKING;
  }
}
