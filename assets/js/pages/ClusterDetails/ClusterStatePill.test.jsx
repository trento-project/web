import React from 'react';
import { screen, render, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import ClusterStatePill from './ClusterStatePill';

describe('ClusterStatePill', () => {
  it.each([
    {
      state: 'S_IDLE',
      displayedState: 'Idle',
      iconClass: 'fill-jungle-green-500',
    },
    {
      state: 'S_TRANSITION_ENGINE',
      displayedState: 'Transition Engine',
      iconClass: 'fill-red-500',
    },
    { state: 'stopped', displayedState: 'Stopped', iconClass: 'fill-gray-500' },
    { state: 'unknown', displayedState: 'Unknown', iconClass: 'fill-gray-500' },
    {
      state: 'S_STARTING',
      displayedState: 'Starting',
      iconClass: 'fill-yellow-500',
    },
  ])(
    'should display cluster state pill with $state',
    ({ state, displayedState, iconClass }) => {
      render(<ClusterStatePill state={state} />);

      const containerSpan = screen.getByText(/State:/i).closest('span');
      expect(containerSpan).toHaveTextContent(displayedState);
      const icon = within(containerSpan).getByTestId('eos-svg-component');
      expect(icon).toHaveClass(iconClass);
    }
  );
});
