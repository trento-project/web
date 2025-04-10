import React from 'react';
import { screen, render } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import GenericError from '.';

describe('GenericError', () => {
  it('should render GenericError component correctly with default parameter values', () => {
    render(<GenericError />);

    expect(screen.getByText('Sorry')).toBeTruthy();

    expect(
      screen.getByText('No further information is known at this point')
    ).toBeTruthy();
  });

  it('should render GenericError correctly with passed message', () => {
    const message = faker.lorem.word();
    render(<GenericError message={message} />);
    expect(screen.getByText('Sorry')).toBeTruthy();

    expect(screen.getByText(message)).toBeTruthy();
  });
});
