import React from 'react';
import { render, screen } from '@testing-library/react';

import { executionValueFactory } from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import ExpectedValues from './ExpectedValues';

describe('ExpectedValues Component', () => {
  it('should render check expected values', async () => {
    const values = executionValueFactory.buildList(3);

    render(<ExpectedValues expectedValues={values} />);

    values.forEach(({ name, value }) => {
      expect(screen.getByText(name)).toBeVisible();
      expect(screen.getByText(value)).toBeVisible();
    });
  });

  it('should render an error', () => {
    render(<ExpectedValues expectedValues={[]} isError />);

    expect(screen.getByText('Expected Values unavailable')).toBeVisible();
  });
});
