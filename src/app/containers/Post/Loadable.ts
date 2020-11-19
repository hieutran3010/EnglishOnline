/**
*
* Asynchronously loads the component for Post
*
*/

import { lazyLoad } from 'utils/loadable';

export const Post = lazyLoad(() => import('./index'), module => module.Post);