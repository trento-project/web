import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartsFeatureWrapper from './ChartsFeatureWrapper';

describe('ChartFeatureWrapper', () => {
  it('should render ChartDisabledBox if the chart feature is disabled', () => {
    render(<ChartsFeatureWrapper chartsEnabled={false} />);
    expect(screen.getByTestId('chart-disabled-box')).toHaveTextContent(
      'disabled'
    );
  });

  it('should render children if the chart feature is enabled', () => {
    render(
      <ChartsFeatureWrapper chartsEnabled>
        {' '}
        <div data-testid="child">child</div>{' '}
      </ChartsFeatureWrapper>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('child');
  });
});
