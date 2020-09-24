import React from 'react';
import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';
import omit from 'lodash/fp/omit';

const ContentContainer = (props: CardProps) => {
  const { children, style } = props;
  return (
    <Card
      className="content-container"
      size="small"
      style={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        ...style,
      }}
      bordered={false}
      {...omit(['style'])(props)}
    >
      {children}
    </Card>
  );
};

export default ContentContainer;
