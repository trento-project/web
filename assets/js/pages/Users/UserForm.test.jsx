import React from 'react';

import { act, render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';

import { abilityFactory, userFactory } from '@lib/test-utils/factories/users';

import UserForm from './UserForm';

describe('UserForm', () => {
  it('should display an empty user form', () => {
    render(<UserForm saveText="Save" />);

    expect(screen.getByText('Full Name')).toBeVisible();
    expect(screen.getByLabelText('fullname').value).toBe('');
    expect(screen.getByText('Email Address')).toBeVisible();
    expect(screen.getByLabelText('email').value).toBe('');
    expect(screen.getByText('Username')).toBeVisible();
    expect(screen.getByLabelText('username').value).toBe('');
    expect(screen.getByText('Password')).toBeVisible();
    expect(screen.getByLabelText('password').value).toBe('');
    expect(screen.getByText('Confirm Password')).toBeVisible();
    expect(screen.getByLabelText('password-confirmation').value).toBe('');
    expect(screen.getByText('Generate Password'));
    expect(screen.getByText('Permissions')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
    expect(screen.queryByText('TOTP')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics Opt-in')).not.toBeInTheDocument();
    expect(screen.queryByText('Created')).not.toBeInTheDocument();
    expect(screen.queryByText('Updated')).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('should display an editing user form', async () => {
    const {
      fullname,
      email,
      username,
      created_at: createdAt,
      updated_at: updatedAt,
      totp_enabled_at: totpEnabledAt,
      analytics_enabled: analyticsEnabled,
    } = userFactory.build();

    await act(async () => {
      render(
        <UserForm
          fullName={fullname}
          emailAddress={email}
          username={username}
          createdAt={createdAt}
          updatedAt={updatedAt}
          totp_enabled_at={totpEnabledAt}
          analyticsEnabledConfig
          analytics_enabled={analyticsEnabled}
          editing
        />
      );
    });

    expect(screen.getByLabelText('fullname').value).toBe(fullname);
    expect(screen.getByLabelText('email').value).toBe(email);
    expect(screen.getByLabelText('username').value).toBe(username);
    expect(screen.getByLabelText('username')).toBeDisabled();
    expect(screen.getAllByPlaceholderText('********').length).toBe(2);
    expect(screen.getByText('Created')).toBeVisible();
    expect(screen.getByText('Updated')).toBeVisible();
    expect(screen.getByText('TOTP')).toBeVisible();
    expect(screen.getByText('Analytics Opt-in')).toBeVisible();
    expect(screen.getByText('Enabled')).toBeVisible();
  });

  it('should display a form with errors', () => {
    const errors = [
      {
        detail: 'Error validating fullname',
        source: { pointer: '/fullname' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating email',
        source: { pointer: '/email' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating username',
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating password',
        source: { pointer: '/password' },
        title: 'Invalid value',
      },
      {
        detail: 'Error validating password_confirmation',
        source: { pointer: '/password_confirmation' },
        title: 'Invalid value',
      },
    ];

    render(<UserForm saveText="Save" errors={errors} />);

    expect(screen.getByText('Error validating fullname')).toBeVisible();
    expect(screen.getByText('Error validating email')).toBeVisible();
    expect(screen.getByText('Error validating username')).toBeVisible();
    expect(screen.getByText('Error validating password')).toBeVisible();
    expect(
      screen.getByText('Error validating password_confirmation')
    ).toBeVisible();
  });

  it('should fail if required fields are missing', async () => {
    const user = userEvent.setup();

    render(<UserForm saveText="Save" />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getAllByText('Required field').length).toBe(5);
  });

  it('should fail if required fields on editing mode are missing', async () => {
    const user = userEvent.setup();
    const { created_at: createdAt, updated_at: updatedAt } =
      userFactory.build();

    render(
      <UserForm
        saveText="Save"
        createdAt={createdAt}
        updatedAt={updatedAt}
        editing
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getAllByText('Required field').length).toBe(3);
  });

  it('should generate a password on button click', async () => {
    const user = userEvent.setup();
    const defaultPasswordSize = 16;
    render(<UserForm />);
    const passwordValueDefault = screen.getByLabelText('password').value;
    expect(passwordValueDefault).toBe('');
    const confirmPasswordValueDefault = screen.getByLabelText(
      'password-confirmation'
    ).value;
    expect(confirmPasswordValueDefault).toBe('');

    await user.click(screen.getByRole('button', { name: 'Generate Password' }));
    const passwordValue = screen.getByLabelText('password').value;
    const confirmPasswordValue = screen.getByLabelText(
      'password-confirmation'
    ).value;
    expect(passwordValue).not.toBe('');
    expect(confirmPasswordValue).not.toBe('');
    expect(passwordValue.length).toBe(defaultPasswordSize);
    expect(confirmPasswordValue.length).toBe(defaultPasswordSize);
  });

  it('should save the user', async () => {
    const user = userEvent.setup();
    const { fullname, email, username } = userFactory.build();
    const password = faker.internet.password();
    const mockOnSave = jest.fn();

    render(<UserForm saveText="Save" onSave={mockOnSave} />);

    await user.type(screen.getByPlaceholderText('Enter full name'), fullname);
    await user.type(screen.getByPlaceholderText('Enter email address'), email);
    await user.type(screen.getByPlaceholderText('Enter username'), username);
    await user.type(screen.getByPlaceholderText('Enter password'), password);
    await user.type(screen.getByPlaceholderText('Re-enter password'), password);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockOnSave).toHaveBeenNthCalledWith(1, {
      fullname,
      email,
      username,
      password,
      password_confirmation: password,
      enabled: true,
      abilities: [],
    });
  });

  it.each([
    { option: 'Enabled', result: true },
    { option: 'Disabled', result: false },
  ])('should set the user status correctly', async ({ option, result }) => {
    const user = userEvent.setup();
    const mockOnSave = jest.fn();

    const {
      fullname,
      email,
      username,
      created_at: createdAt,
      updated_at: updatedAt,
    } = userFactory.build();

    await act(async () => {
      render(
        <UserForm
          fullName={fullname}
          emailAddress={email}
          username={username}
          createdAt={createdAt}
          updatedAt={updatedAt}
          editing
          onSave={mockOnSave}
        />
      );
    });

    await user.click(screen.getByText('Enabled'));
    await user.click(screen.getAllByText(option)[0]);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(mockOnSave).toHaveBeenNthCalledWith(1, {
      fullname,
      email,
      enabled: result,
      abilities: [],
    });
  });

  it('should allow to disable TOTP correctly', async () => {
    const user = userEvent.setup();
    const mockOnSave = jest.fn();

    const {
      fullname,
      email,
      username,
      created_at: createdAt,
      updated_at: updatedAt,
      totp_enabled_at: totpEnabledAt,
    } = userFactory.build();

    await act(async () => {
      render(
        <UserForm
          saveText="Save"
          fullName={fullname}
          emailAddress={email}
          username={username}
          createdAt={createdAt}
          updatedAt={updatedAt}
          totpEnabledAt={totpEnabledAt}
          editing
          onSave={mockOnSave}
        />
      );
    });
    await user.click(screen.getAllByText('Enabled')[1]);
    await user.click(screen.getByText('Disabled'));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockOnSave).toHaveBeenNthCalledWith(1, {
      fullname,
      email,
      enabled: true,
      abilities: [],
      totp_disabled: true,
    });
  });

  it('should not allow to enable TOTP from user mgmt', async () => {
    const user = userEvent.setup();
    const mockOnSave = jest.fn();

    const {
      fullname,
      email,
      username,
      created_at: createdAt,
      updated_at: updatedAt,
      totp_enabled_at: totpEnabledAt,
    } = userFactory.build({ totp_enabled_at: null });

    await act(async () => {
      render(
        <UserForm
          fullName={fullname}
          emailAddress={email}
          username={username}
          createdAt={createdAt}
          updatedAt={updatedAt}
          totpEnabledAt={totpEnabledAt}
          editing
        />
      );
    });

    await user.click(screen.getByText('Disabled'));

    expect(screen.getAllByText('Enabled')[1].closest('div')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should save the new abilities', async () => {
    const user = userEvent.setup();
    const abilities = abilityFactory.buildList(3);
    const userAbilities = [abilities[0]];
    const {
      fullname,
      email,
      username,
      created_at: createdAt,
      updated_at: updatedAt,
    } = userFactory.build();

    const mockOnSave = jest.fn();

    render(
      <UserForm
        saveText="Save"
        onSave={mockOnSave}
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        userAbilities={userAbilities}
        createdAt={createdAt}
        updatedAt={updatedAt}
        editing
      />
    );

    expect(
      screen.getByText(`${userAbilities[0].name}:${userAbilities[0].resource}`)
    ).toBeVisible();

    await user.click(screen.getByLabelText('permissions'));

    abilities.forEach(({ name, resource }) =>
      expect(screen.getByText(`${name}:${resource}`)).toBeVisible()
    );

    await user.click(
      screen.getByText(`${abilities[1].name}:${abilities[1].resource}`)
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockOnSave).toHaveBeenNthCalledWith(1, {
      fullname,
      email,
      enabled: true,
      abilities: abilities.slice(0, 2),
    });
  });

  describe('Single sign on', () => {
    it('should disable fullname, email and username fields', () => {
      render(<UserForm saveText="Save" editing singleSignOnEnabled />);

      expect(screen.getByLabelText('fullname')).toBeDisabled();
      expect(screen.getByLabelText('email')).toBeDisabled();
      expect(screen.getByLabelText('username')).toBeDisabled();
    });

    it('should remove password, totp and timestamp fields', () => {
      render(<UserForm saveText="Save" editing singleSignOnEnabled />);

      expect(screen.queryByText('Created')).not.toBeInTheDocument();
      expect(screen.queryByText('Updated')).not.toBeInTheDocument();
      expect(screen.queryByText('TOTP')).not.toBeInTheDocument();
      expect(screen.getByText('Permissions')).toBeVisible();
      expect(screen.getByText('Enabled')).toBeVisible();
    });

    it('should save permissions and status', async () => {
      const user = userEvent.setup();

      const { fullname, email, username } = userFactory.build();

      const abilities = abilityFactory.buildList(3);
      const userAbilities = [abilities[0]];

      const mockOnSave = jest.fn();

      render(
        <UserForm
          saveText="Save"
          onSave={mockOnSave}
          fullName={fullname}
          emailAddress={email}
          username={username}
          editing
          abilities={abilities}
          userAbilities={userAbilities}
          singleSignOnEnabled
        />
      );

      expect(
        screen.getByText(
          `${userAbilities[0].name}:${userAbilities[0].resource}`
        )
      ).toBeVisible();

      await user.click(screen.getByLabelText('permissions'));

      abilities.forEach(({ name, resource }) =>
        expect(screen.getByText(`${name}:${resource}`)).toBeVisible()
      );

      await user.click(
        screen.getByText(`${abilities[1].name}:${abilities[1].resource}`)
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnSave).toHaveBeenNthCalledWith(1, {
        enabled: true,
        abilities: abilities.slice(0, 2),
      });
    });
  });
});
