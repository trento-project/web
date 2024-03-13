import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Banner from './Banner';

describe('Banner', () => {
  it('should display a banner with its text and icon', () => {
    render(
      <Banner>
        Warning!
        <br />
        You should have a look on this!
      </Banner>
    );

    expect(screen.getByTestId('banner')).toHaveTextContent(
      'You should have a look on this!'
    );
  });
});
