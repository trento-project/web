import React from 'react';

import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import ProfilePasswordChangeForm from '@pages/Profile/ProfilePasswordChangeForm';
import { faker } from '@faker-js/faker';

describe('ProfilePasswordChangeForm', () => {
  it('should render an empty form', () => {
    render(<ProfilePasswordChangeForm />);

    expect(screen.getByText('Current Password')).toBeVisible();
    expect(screen.getByLabelText('current_password').value).toBe('');
    expect(screen.getByText('New Password')).toBeVisible();
    expect(screen.getByLabelText('password').value).toBe('');
    expect(screen.getByText('Confirm New Password')).toBeVisible();
    expect(screen.getByLabelText('password_confirmation').value).toBe('');
  });

  it('should fail validation if required fields are missing', async () => {
    const user = userEvent.setup();

    render(<ProfilePasswordChangeForm />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getAllByText('Required field').length).toBe(3);
  });

  it('should show errors when provided', async () => {
    const errors = [
      {
        detail: 'Error validating password',
        source: { pointer: '/password' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating current_password',
        source: { pointer: '/current_password' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating password_confirmation',
        source: { pointer: '/password_confirmation' },
        title: 'Invalid value',
      },
    ];

    render(<ProfilePasswordChangeForm errors={errors} />);

    expect(screen.getByText('Error validating password')).toBeVisible();
    expect(screen.getByText('Error validating current_password')).toBeVisible();
    expect(
      screen.getByText('Error validating password_confirmation')
    ).toBeVisible();
  });

  it('should send the form values when correctly filled', async () => {
    const mockOnSave = jest.fn();

    const currentPassword = faker.internet.password();
    const newPassword = faker.internet.password();

    render(<ProfilePasswordChangeForm onSave={mockOnSave} />);

    const user = userEvent.setup();

    await act(async () => {
      await user.type(
        screen.getByLabelText('current_password'),
        currentPassword
      );
      await user.type(screen.getByLabelText('password'), newPassword);
      await user.type(
        screen.getByLabelText('password_confirmation'),
        newPassword
      );
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockOnSave).toHaveBeenNthCalledWith(1, {
      password: newPassword,
      current_password: currentPassword,
      password_confirmation: newPassword,
    });
  });

  it('should call onCancel when the cancel button is clicked', async () => {
    const mockOnCancel = jest.fn();

    render(<ProfilePasswordChangeForm onCancel={mockOnCancel} />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
