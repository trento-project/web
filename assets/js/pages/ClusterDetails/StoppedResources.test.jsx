import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import StoppedResources from './StoppedResources';

it('should display a "No resources to display." message when there are no resources', async () => {
  render(<StoppedResources resources={[]} />);

  expect(screen.getByText('No resources to display.')).toBeInTheDocument();
});
