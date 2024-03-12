import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Banner from './Banner';

describe('Banner', () => {
  it('should display a warning banner with its text and icon', () => {
    render(
      <Banner>
        Warning!
        <br />
        You should have a look on this!
      </Banner>
    );

    expect(screen.getByTestId('warning-banner')).toHaveTextContent(
      'Warning!You should have a look on this!'
    );
  });
});
