import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import SaptuneTuningState from './SaptuneTuningState';

describe('SpatuneTuningState', () => {
  it.each([
    { state: 'compliant', text: 'Compliant', iconClass: null },
    {
      state: 'not compliant',
      text: 'Not compliant',
      iconClass: 'fill-red-500',
    },
    { state: 'no tuning', text: 'No tuning', iconClass: 'fill-yellow-500' },
    { state: null, text: '-', icon: null },
  ])(
    'should render correctly the $state state',
    ({ state, text, iconClass }) => {
      render(<SaptuneTuningState state={state} />);

      expect(screen.getByText(text)).toBeTruthy();

      if (iconClass) {
        const icon = screen.getByTestId('eos-svg-component');
        expect(icon).toHaveClass(iconClass);
      }
    }
  );
});
