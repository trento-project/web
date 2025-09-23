import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import NewPersonalAccessTokenModal from './NewPersonalAccessTokenModal';

describe('NewPersonalAccessTokenModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete personal access token modal', async () => {
    const token = faker.internet.jwt();
    await act(async () => {
      render(<NewPersonalAccessTokenModal accessToken={token} isOpen />);
    });

    expect(screen.getByText(token)).toBeInTheDocument();
  });

  it('should copy the content of the access token', async () => {
    const user = userEvent.setup();
    const token = faker.internet.jwt();
    jest.spyOn(window, 'prompt').mockReturnValue();

    await act(async () => {
      render(<NewPersonalAccessTokenModal accessToken={token} isOpen />);
    });

    await user.click(screen.getByRole('button', { name: 'copy to clipboard' }));

    expect(window.prompt).toHaveBeenCalledWith(expect.anything(), token);
  });

  it('should run onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    await act(async () => {
      render(<NewPersonalAccessTokenModal isOpen onClose={mockOnClose} />);
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
