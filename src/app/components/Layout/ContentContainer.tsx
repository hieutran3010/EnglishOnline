import React from 'react';
import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';

const ContentContainer = ({ ...props }: CardProps) => {
  const { children } = props;
  return <Card {...props}>{children}</Card>;
};

export default ContentContainer;
