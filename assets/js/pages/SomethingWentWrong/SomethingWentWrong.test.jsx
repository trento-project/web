import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithRouter } from '@lib/test-utils';

import SomethingWentWrong from '.';

describe('SomethingWentWrong', () => {
  it('should render correctly', () => {
    renderWithRouter(<SomethingWentWrong />);

    expect(screen.getByText('Something went wrong.')).toBeTruthy();
    fireEvent.click(screen.getByText('Go back home'));
  });
});
