import React from 'react';
import { fireEvent, screen, render } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import { renderWithRouter } from '@lib/test-utils';

import NotFound from '.';

describe('NotFound', () => {
  it('should render NotFound component correctly with default parameter values', () => {
    render(<NotFound />);

    expect(
      screen.getByText(/Sorry,.*the page is in another castle/)
    ).toBeTruthy();

    expect(screen.getByText('Go back home')).toBeTruthy();
    fireEvent.click(screen.getByText('Go back home'));
    expect(window.location.pathname).toEqual('/');
  });

  it('should render NotFound correctly with passed props', () => {
    const url = faker.internet.url();
    const buttonText = faker.lorem.word();
    const navigate = jest.fn();
    renderWithRouter(
      <NotFound buttonText={buttonText} onNavigate={() => navigate(url)} />
    );
    expect(
      screen.getByText(/Sorry,.*the page is in another castle/)
    ).toBeTruthy();

    expect(screen.getByText(buttonText)).toBeTruthy();
    fireEvent.click(screen.getByText(buttonText));
    expect(navigate).toHaveBeenCalledWith(url);
  });
});
