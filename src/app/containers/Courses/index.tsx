/**
*
* Courses
*
*/

import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey } from './slice';
import { selectCourses } from './selectors';
import { coursesSaga } from './saga';

interface Props {}


export const Courses = memo((props: Props) => {
useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: coursesSaga });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const courses = useSelector(selectCourses);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dispatch = useDispatch();


return (
<>
    <div>
  </div>
</>
);

});

