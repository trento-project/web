import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import OperationForbiddenModal from './OperationForbiddenModal';

describe('OperationForbiddenModal', () => {
  it('should show forbidden operation modal', async () => {
    await act(async () => {
      render(
        <OperationForbiddenModal
          operation="My operation"
          errors={['error1', 'error2']}
          isOpen
        >
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

    const list = screen.getByRole('list');
    const { getAllByRole } = within(list);
    const items = getAllByRole('listitem');
    expect(items[0].textContent).toBe('error1');
    expect(items[1].textContent).toBe('error2');

    expect(screen.getByText('Some children')).toBeInTheDocument();
  });

  it('should run onCancel when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();
    await act(async () => {
      render(
        <OperationForbiddenModal
          operation="My operation"
          errors={[]}
          isOpen
          onCancel={mockOnCancel}
        >
          Some children
        </OperationForbiddenModal>
      );
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
