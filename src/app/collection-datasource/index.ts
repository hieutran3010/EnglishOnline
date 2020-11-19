import GraphQLDataSource from './graphql';
import PostFetcher from 'app/fetchers/postFetcher';
import PostCommentFetcher from 'app/fetchers/postCommentFetcher';

export enum FETCHER_KEY {
  POST,
  POST_COMMENT,
}

const getDataSource = (fetcherKey: FETCHER_KEY, extendFields?: string[]) => {
  switch (fetcherKey) {
    case FETCHER_KEY.POST: {
      return new GraphQLDataSource(new PostFetcher());
    }
    case FETCHER_KEY.POST_COMMENT: {
      return new GraphQLDataSource(new PostCommentFetcher());
    }
  }
};

export default getDataSource;
