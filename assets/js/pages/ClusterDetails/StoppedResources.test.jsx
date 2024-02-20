import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import StoppedResources from './StoppedResources';

it('should display a "No resources to display." message when there are no resources', async () => {
  renderWithRouter(<StoppedResources resources={[]} />);

  expect(screen.getByText('No resources to display.')).toBeInTheDocument();
});
