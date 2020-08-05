import WrappedAxiosFetcher from './WrappedAxiosFetcher';
import { authService } from 'app/services/auth';

export default class RestfulFetcherBase<TModel> extends WrappedAxiosFetcher<
  TModel
> {
  constructor(controller: string) {
    const endpoint = `${process.env.REACT_APP_API_ENDPOINT}/${controller}`;
    super(endpoint, authService.getIdTokenAsync);
  }
}
