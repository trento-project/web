import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as router from 'react-router';

import BackButton from './';

const navigate = jest.fn();

describe('BackButton', () => {
  it('should display a back button with correct text and url', () => {
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

    render(<BackButton url="/back/hell">Back to hell!</BackButton>);
    const backButton = screen.getByRole('button');
    expect(backButton).toHaveTextContent('Back to hell!');

    fireEvent.click(backButton);
    expect(navigate).toHaveBeenCalledWith('/back/hell');
  });
});
