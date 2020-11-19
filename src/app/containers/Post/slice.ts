import { PayloadAction } from '@reduxjs/toolkit';
import Post from 'app/models/post';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState } from './types';
import { v4 as uuidv4 } from 'uuid';

// The initial state of the Post container
export const initialState: ContainerState = {
  posts: [],
  isFetchingPosts: false,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    fetchPosts(state) {
      state.isFetchingPosts = true;
    },
    fetchPostsCompleted(state, action: PayloadAction<Post[]>) {
      state.isFetchingPosts = false;
      state.posts = action.payload;
    },
    submitPost(state, action: PayloadAction<Post>) {
      state.posts.splice(0, 0, {
        id: uuidv4(),
        owner: 'Lê Trang',
        ownerAvatar:
          'https://scontent.fvca1-2.fna.fbcdn.net/v/t1.0-9/120123166_10158465360393956_8815174325295557887_n.jpg?_nc_cat=100&ccb=2&_nc_sid=09cbfe&_nc_ohc=1zpC98ZIgGIAX_Dj9Mt&_nc_ht=scontent.fvca1-2.fna&oh=8361b5528fa55e30439223d27fa7d998&oe=5FDBF5E4',
        content: action.payload.content,
      });
    },
  },
});

export const { actions, reducer, name: sliceKey } = postSlice;
