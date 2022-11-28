import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import WarningBanner from './WarningBanner';

describe('WarningBanner', () => {
  it('should display a warning banner with its text and icon', () => {
    render(
      <WarningBanner>
        Warning!
        <br />
        You should have a look on this!
      </WarningBanner>,
    );

    expect(screen.getByTestId('warning-banner')).toHaveTextContent(
      'Warning!You should have a look on this!',
    );
  });
});
