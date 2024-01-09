import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartsFeatureWrapper from './ChartsFeatureWrapper';

describe('ChartFeatureWrapper', () => {
  afterEach(() => {
    global.config = { chartsEnabled: false };
  });

  it('should render ChartDisabledBox if the chart feature is disabled', () => {
    global.config = { chartsEnabled: false };

    render(<ChartsFeatureWrapper />);
    expect(screen.getByTestId('chart-disabled-box')).toHaveTextContent(
      'disabled'
    );
  });

  it('should render children if the chart feature is enabled', () => {
    global.config = { chartsEnabled: true };

    render(
      <ChartsFeatureWrapper>
        {' '}
        <div data-testid="child">child</div>{' '}
      </ChartsFeatureWrapper>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('child');
  });
});
