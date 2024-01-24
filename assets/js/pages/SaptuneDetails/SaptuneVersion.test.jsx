import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import SaptuneVersion from './SaptuneVersion';

describe('SaptuneVersion', () => {
  it.each([
    {
      version: null,
      text: 'Not installed',
      iconCss: 'fill-yellow-500',
      sapPresent: true,
    },
    {
      version: null,
      text: 'Not installed',
      iconCss: null,
      sapPresent: false,
    },
    {
      version: '3.0.0',
      text: '3.0.0',
      iconCss: 'fill-yellow-500',
      sapPresent: true,
    },
    { version: '3.1.0', text: '3.1.0', iconCss: null, sapPresent: true },
  ])(
    'should render correctly the $version version',
    ({ version, text, iconClass, sapPresent }) => {
      render(<SaptuneVersion sapPresent={sapPresent} version={version} />);

      expect(screen.getByText(text)).toBeTruthy();

      if (iconClass) {
        const icon = screen.getByTestId('eos-svg-component');
        expect(icon).toHaveClass(iconClass);
      }
    }
  );
});
