import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import DeleteTokenModal from './DeleteTokenModal';

describe('DeleteTokenModal', () => {
  it('should show personal access token modal', async () => {
    render(<DeleteTokenModal name="My token" isOpen />);

    expect(screen.getByText('My token')).toBeInTheDocument();
  });

  it('should run onDelete when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnDelete = jest.fn();
    render(<DeleteTokenModal isOpen onDelete={mockOnDelete} />);

    await user.click(screen.getByRole('button', { name: 'Delete Token' }));
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should run onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    render(<DeleteTokenModal isOpen onClose={mockOnClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
