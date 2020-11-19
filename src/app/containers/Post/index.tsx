/**
*
* Post
*
*/

import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey } from './slice';
import { selectPost } from './selectors';
import { postSaga } from './saga';

interface Props {}


export const Post = memo((props: Props) => {
useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: postSaga });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const post = useSelector(selectPost);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dispatch = useDispatch();


return (
<>
    <div>
  </div>
</>
);

});

