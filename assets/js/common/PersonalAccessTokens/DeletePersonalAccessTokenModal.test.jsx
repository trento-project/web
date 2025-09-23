import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import DeletePersonalAccessTokenModal from './DeletePersonalAccessTokenModal';

describe('DeletePersonalAccessTokenModal', () => {
  it('should delete personal access token modal', async () => {
    await act(async () => {
      render(<DeletePersonalAccessTokenModal name="My token" isOpen />);
    });

    expect(screen.getByText('My token')).toBeInTheDocument();
  });

  it('should run onDelete when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnDelete = jest.fn();
    await act(async () => {
      render(<DeletePersonalAccessTokenModal isOpen onDelete={mockOnDelete} />);
    });

    await user.click(screen.getByRole('button', { name: 'Delete Token' }));
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should run onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    await act(async () => {
      render(<DeletePersonalAccessTokenModal isOpen onClose={mockOnClose} />);
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
