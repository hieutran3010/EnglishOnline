/**
*
* Asynchronously loads the component for Courses
*
*/

import { lazyLoad } from 'utils/loadable';

export const Courses = lazyLoad(() => import('./index'), module => module.Courses);