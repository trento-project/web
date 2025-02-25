import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import OperationForbiddenModal from './OperationForbiddenModal';

describe('OperationForbiddenModal', () => {
  it('should show forbidden operation modal', async () => {
    await act(async () => {
      render(
        <OperationForbiddenModal operation="My operation" isOpen>
          Some children
        </OperationForbiddenModal>
      );
    });

    expect(screen.getByText('Operation Forbidden')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Unable to run My operation operation. Some of the conditions are not met.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Some children')).toBeInTheDocument();
  });

  it('should run onCancel when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();
    await act(async () => {
      render(
        <OperationForbiddenModal
          operation="My operation"
          isOpen
          onCancel={mockOnCancel}
        >
          Some children
        </OperationForbiddenModal>
      );
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnCancel).toBeCalled();
  });
});
