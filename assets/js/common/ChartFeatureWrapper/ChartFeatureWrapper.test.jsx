import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartFeatureWrapper from './ChartFeatureWrapper';

describe('ChartFeatureWrapper', () => {
  afterEach(() => {
    global.config = { chartsEnabled: false };
  });

  it('should render ChartDisabledBox if the chart feature is disabled', () => {
    global.config = { chartsEnabled: false };

    render(<ChartFeatureWrapper />);
    expect(screen.getByTestId('chart-disabled-box')).toHaveTextContent(
      'disabled'
    );
  });

  it('should render children if the chart feature is enabled', () => {
    global.config = { chartsEnabled: true };

    render(
      <ChartFeatureWrapper>
        {' '}
        <div data-testid="child">child</div>{' '}
      </ChartFeatureWrapper>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('child');
  });
});
