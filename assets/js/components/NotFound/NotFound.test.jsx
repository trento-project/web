import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import { useNavigate } from 'react-router-dom';

import { renderWithRouter } from '@lib/test-utils';

import NotFound from '.';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('NotFound', () => {
  it('should render correctly', () => {
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    renderWithRouter(<NotFound />);

    expect(
      screen.getByText(/Sorry,.*the page is in another castle/)
    ).toBeTruthy();

    const backButton = screen.getByText('Go back home');
    expect(backButton).toBeTruthy();

    fireEvent.click(backButton);
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('should render correctly with passed props', () => {
    const url = faker.internet.url();
    const buttonText = faker.lorem.word();
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    renderWithRouter(
      <NotFound buttonText={buttonText} onNavigate={() => navigate(url)} />
    );
    expect(
      screen.getByText(/Sorry,.*the page is in another castle/)
    ).toBeTruthy();

    const backButton = screen.getByText(buttonText);
    expect(backButton).toBeTruthy();

    fireEvent.click(backButton);
    expect(navigate).toHaveBeenCalledWith(url);
  });
});
