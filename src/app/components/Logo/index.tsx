import React, { memo } from 'react';

interface Props {
  isSmall?: boolean;
  logoSmallSrc?: string | any;
  logoSrc?: string | any;
  height?: number;
}
const Logo = ({ isSmall, logoSmallSrc, logoSrc, height }: Props) => {
  return (
    <img
      src={isSmall ? logoSmallSrc : logoSrc}
      height={`${height ?? 40}px`}
      alt=""
    />
  );
};

export default memo(Logo);
