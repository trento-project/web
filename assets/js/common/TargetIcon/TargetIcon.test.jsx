import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetIcon from './TargetIcon';

describe('TargetIcon', () => {
  it.each([null, undefined, 'unsupported'])(
    'should not render a target icon when the target type is either absent or not recognized',
    (unsupportedTargetType) => {
      render(<TargetIcon targetType={unsupportedTargetType} />);

      expect(screen.queryByTestId('target-icon')).not.toBeInTheDocument();
    }
  );

  const targetTypesScenarios = [
    {
      targetType: 'cluster',
      targetIcon: 'target-icon-cluster',
    },
    {
      targetType: 'host',
      targetIcon: 'target-icon-host',
    },
  ];

  it.each(targetTypesScenarios)(
    'should render target type $targetType icon',
    ({ targetType, targetIcon }) => {
      render(<TargetIcon targetType={targetType} />);

      expect(screen.getByTestId('target-icon')).toBeVisible();
      expect(screen.getByTestId(targetIcon)).toBeVisible();
    }
  );

  const labaledTargetIconsScenarios = [
    {
      targetType: 'cluster',
      label: 'Clusters',
    },
    {
      targetType: 'host',
      label: 'Hosts',
    },
  ];

  it.each(labaledTargetIconsScenarios)(
    'should render labaled target type $targetType icon',
    ({ targetType, label }) => {
      render(<TargetIcon targetType={targetType}>{label}</TargetIcon>);

      expect(screen.getByTestId('target-label')).toBeVisible();
      expect(screen.getByText(label)).toBeVisible();
    }
  );
});
