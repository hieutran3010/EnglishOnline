/**
 *
 * Post
 *
 */

import React, { memo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Avatar,
  Button,
  Card,
  Col,
  List,
  Row,
  Skeleton,
  Typography,
  Form,
  Input,
  Space,
  Comment,
} from 'antd';
import { LikeOutlined, CommentOutlined } from '@ant-design/icons';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, actions } from './slice';
import { selectPosts, selectIsFetchingPosts } from './selectors';
import { postSaga } from './saga';
import PostModel from 'app/models/post';
import size from 'lodash/fp/size';
import PostComment from 'app/models/postComment';

const { Meta } = Card;

const { Text } = Typography;

export const Post = memo(() => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: postSaga });

  const posts = useSelector(selectPosts);
  const isFetchingPosts = useSelector(selectIsFetchingPosts);
  const dispatch = useDispatch();

  const [postForm] = Form.useForm();
  const [commentForm] = Form.useForm();

  useEffect(() => {
    dispatch(actions.fetchPosts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRenderComment = useCallback((postComment: PostComment) => {
    return (
      <Comment
        author={<a>{postComment.owner}</a>}
        avatar={
          <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
        }
        content={<p>{postComment.content}</p>}
      />
    );
  }, []);

  const onSubmitComment = useCallback(form => {
    console.log(form);
  }, []);

  const onRenderPost = useCallback(
    (postModel: PostModel) => {
      return (
        <Card style={{ marginBottom: 15 }}>
          <Skeleton loading={isFetchingPosts} avatar active>
            <Meta
              avatar={<Avatar src={postModel.ownerAvatar} />}
              title={<Text strong>{postModel.owner}</Text>}
              description={<Text>{postModel.content}</Text>}
            />
            <Space
              style={{
                width: '100%',
                borderTop: '1px solid #CCCCCC',
                borderBottom: '1px solid #CCCCCC',
                justifyContent: 'space-around',
                marginTop: 20,
              }}
            >
              <Button
                icon={<LikeOutlined />}
                key="like"
                type="ghost"
                style={{ border: 0, boxShadow: 'none' }}
              >
                Like
              </Button>
              <Button
                icon={<CommentOutlined />}
                key="comment"
                type="ghost"
                style={{ border: 0, boxShadow: 'none' }}
              >
                Comment
              </Button>
            </Space>
            {postModel.postComments && size(postModel.postComments) > 0 && (
              <>
                <List
                  dataSource={postModel.postComments}
                  renderItem={onRenderComment}
                  rowKey={comment => comment.id}
                />

                <Form
                  layout="inline"
                  form={commentForm}
                  onFinish={onSubmitComment}
                >
                  <Form.Item>
                    <Avatar src="https://scontent.fvca1-2.fna.fbcdn.net/v/t1.0-9/120123166_10158465360393956_8815174325295557887_n.jpg?_nc_cat=100&ccb=2&_nc_sid=09cbfe&_nc_ohc=1zpC98ZIgGIAX_Dj9Mt&_nc_ht=scontent.fvca1-2.fna&oh=8361b5528fa55e30439223d27fa7d998&oe=5FDBF5E4" />
                  </Form.Item>
                  <Form.Item
                    name="content"
                    style={{ flex: 1 }}
                    rules={[
                      { required: true, message: 'Please write something!' },
                    ]}
                  >
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Write a comment..."
                    />
                  </Form.Item>
                </Form>
              </>
            )}
          </Skeleton>
        </Card>
      );
    },
    [commentForm, isFetchingPosts, onRenderComment, onSubmitComment],
  );

  const onSubmitPost = useCallback(
    form => {
      dispatch(actions.submitPost(form));
      postForm.resetFields();
    },
    [dispatch, postForm],
  );

  return (
    <>
      <Row style={{ width: '100%' }} justify="center">
        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
          <Card style={{ marginBottom: 15 }}>
            <Form layout="inline" form={postForm} onFinish={onSubmitPost}>
              <Form.Item>
                <Avatar src="https://scontent.fvca1-2.fna.fbcdn.net/v/t1.0-9/120123166_10158465360393956_8815174325295557887_n.jpg?_nc_cat=100&ccb=2&_nc_sid=09cbfe&_nc_ohc=1zpC98ZIgGIAX_Dj9Mt&_nc_ht=scontent.fvca1-2.fna&oh=8361b5528fa55e30439223d27fa7d998&oe=5FDBF5E4" />
              </Form.Item>
              <Form.Item
                name="content"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Please input something!' }]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="What's on your mind?"
                />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary" shape="round">
                  POST
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row style={{ width: '100%', height: '100%' }} justify="center">
        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
          <List
            dataSource={posts}
            renderItem={onRenderPost}
            rowKey={post => post.id}
          />
        </Col>
      </Row>
    </>
  );
});
