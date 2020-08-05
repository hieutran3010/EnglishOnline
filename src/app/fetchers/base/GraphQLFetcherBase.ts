import { GraphQLDoorClient, GraphQLEntityFetcher } from 'graphql-door-client';
import { authService } from 'app/services/auth';

export default class GraphQLFetcherBase<TModel> extends GraphQLEntityFetcher<
  TModel
> {
  graphqlDoorClient: GraphQLDoorClient;

  constructor(entityName: string, onGetDefaultSelectFields: () => string[]) {
    const endpoint = `${process.env.REACT_APP_API_ENDPOINT}/graphql`;
    const client = new GraphQLDoorClient(endpoint, {
      getToken: authService.getIdTokenAsync,
    });
    super(entityName, onGetDefaultSelectFields, client);

    this.graphqlDoorClient = client;
  }
}
