import React, { ReactElement, useCallback, useMemo } from 'react';
import { PageHeader } from 'antd';
import { StyledContainer } from './styles/StyledRootContainer';
import { PageHeaderProps } from 'antd/lib/page-header';

interface Props {
  title: string | ReactElement;
  subTitle?: string;
  children: any;
  rightComponents?: ReactElement[];
  canBack: boolean;
  onBack?: () => void;
}
const RootContainer = ({
  title,
  subTitle,
  children,
  rightComponents,
  canBack,
  onBack,
  ...restProps
}: Props & PageHeaderProps) => {
  const _onBack = useCallback(() => window.history.back(), []);

  const getOnBackFunc = useMemo(() => {
    if (onBack) {
      return onBack;
    }

    if (canBack === true) {
      return _onBack;
    }

    return undefined;
  }, [_onBack, canBack, onBack]);

  return (
    <StyledContainer>
      <PageHeader
        className="site-page-header"
        title={title}
        subTitle={subTitle}
        style={{ margin: 10, marginBottom: 0 }}
        extra={rightComponents}
        onBack={getOnBackFunc}
        {...restProps}
      />
      <div>{children}</div>
    </StyledContainer>
  );
};

RootContainer.defaultProps = {
  canBack: false,
};

export default RootContainer;
