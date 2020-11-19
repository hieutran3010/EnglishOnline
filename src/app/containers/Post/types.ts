import Post from 'app/models/post';

/* --- STATE --- */
export interface PostState {
  isFetchingPosts: boolean;
  posts: Post[];
}

export type ContainerState = PostState;
