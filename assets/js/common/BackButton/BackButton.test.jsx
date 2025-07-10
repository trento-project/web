/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as router from 'react-router';

import BackButton from '.';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

describe('BackButton', () => {
  it('should display a back button with correct text and url', () => {
    const navigate = jest.fn();
    router.useNavigate.mockReturnValue(navigate);
    render(<BackButton url="/back/hell">Back to hell!</BackButton>);
    const backButton = screen.getByRole('button');
    expect(backButton).toHaveTextContent('Back to hell!');

    fireEvent.click(backButton);
    expect(navigate).toHaveBeenCalledWith('/back/hell');
  });
});
