import React from 'react';

import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import { profileFactory } from '@lib/test-utils/factories/users';

import ProfileForm from '@pages/Profile/ProfileForm';

describe('ProfileForm', () => {
  it('should render a pre-filled form', () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
      />
    );

    expect(screen.getByText('Full Name')).toBeVisible();
    expect(screen.getByLabelText('fullname').value).toBe(fullname);
    expect(screen.getByText('Email Address')).toBeVisible();
    expect(screen.getByLabelText('email').value).toBe(email);
    expect(screen.getByText('Username')).toBeVisible();
    expect(screen.getByLabelText('username').value).toBe(username);
    expect(screen.getByText('Permissions')).toBeVisible();
    abilities.forEach(({ resource, name }) => {
      expect(screen.getByText(`${name}:${resource}`)).toBeVisible();
    });
    expect(screen.getByText('Change Password')).toBeVisible();
    expect(screen.getByText('Save')).toBeVisible();
  });

  it('should fail validation if required fields are missing', async () => {
    const user = userEvent.setup();

    render(<ProfileForm />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getAllByText('Required field').length).toBe(2);
  });

  it('should show errors when provided', async () => {
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
    ];

    render(<ProfileForm errors={errors} />);

    expect(screen.getByText('Error validating fullname')).toBeVisible();
    expect(screen.getByText('Error validating email')).toBeVisible();
  });

  it('should send the form values when correctly filled', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();
    const mockOnSave = jest.fn();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        onSave={mockOnSave}
      />
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockOnSave).toHaveBeenNthCalledWith(1, {
      fullname,
      email,
    });
  });

  it('should trigger the modal toggle function for password change form when change password button is clicked', async () => {
    const user = userEvent.setup();
    const onModalToggle = jest.fn();

    render(<ProfileForm togglePasswordModal={onModalToggle} />);
    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(onModalToggle).toHaveBeenCalled();
  });

  it('should open the modal when the modal open props is set to true', () => {
    render(<ProfileForm passwordModalOpen />);

    expect(screen.getByText('Current Password')).toBeVisible();
  });

  it('should set the authenticator app switch when totpEnabled is true', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpEnabled
      />
    );

    expect(screen.getByRole('switch')).toBeVisible();
    expect(
      screen.getByRole('switch').attributes.getNamedItem('aria-checked').value
    ).toBe('true');
  });

  it('should set analytics checkbox when analyticsEnabled is true', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        analyticsEnabled
      />
    );

    expect(screen.getByRole('checkbox')).toBeVisible();
    expect(screen.getByRole('checkbox').checked).toBe(true);
  });

  it('should not set the authenticator app switch when totpEnabled is false', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpEnabled={false}
      />
    );

    expect(screen.getByRole('switch')).toBeVisible();
    expect(
      screen.getByRole('switch').attributes.getNamedItem('aria-checked').value
    ).toBe('false');
  });

  it('should call onEnableTotp when totpEnabled is false and the switch is clicked', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    const onEnableTotp = jest.fn();
    const user = userEvent.setup();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpEnabled={false}
        onEnableTotp={onEnableTotp}
      />
    );

    expect(screen.getByRole('switch')).toBeVisible();

    await act(async () => {
      await user.click(screen.getByRole('switch'));
    });

    expect(onEnableTotp).toHaveBeenCalled();
  });

  it('should call onResetTotp when totpEnabled is true, the switch is clicked and the user confirms with the modal', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    const onResetTotp = jest.fn();
    const user = userEvent.setup();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpEnabled
        onResetTotp={onResetTotp}
      />
    );

    expect(screen.getByRole('switch')).toBeVisible();

    await act(async () => {
      await user.click(screen.getByRole('switch'));
    });

    await act(async () => {
      await user.click(screen.getByText('Disable'));
    });

    expect(onResetTotp).toHaveBeenCalled();
  });

  it('should show the totp enrollment box when totpBoxOpen is set to true', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    const totpSecret = faker.string.uuid();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpSecret={totpSecret}
        totpQrData={totpSecret}
        totpBoxOpen
      />
    );

    expect(screen.getByText(totpSecret)).toBeVisible();
  });

  it('should hide the totp enrollment box when Cancel button is clicked', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    const totpSecret = faker.string.uuid();
    const toggleTotpBox = jest.fn();

    const user = userEvent.setup();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpSecret={totpSecret}
        totpQrData={totpSecret}
        totpBoxOpen
        toggleTotpBox={toggleTotpBox}
      />
    );

    expect(screen.getByText(totpSecret)).toBeVisible();

    await act(async () => {
      await user.click(screen.getByText('Cancel'));
    });

    expect(toggleTotpBox).toHaveBeenCalledWith(false);
  });

  it('should call onVerifyTotp when the totp box is shown and the verify button is clicked', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    const onVerifyTotp = jest.fn();
    const totpSecret = faker.string.uuid();

    const user = userEvent.setup();

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpSecret={totpSecret}
        totpQrData={totpSecret}
        totpBoxOpen
        onVerifyTotp={onVerifyTotp}
      />
    );

    await act(async () => {
      await user.type(screen.getByLabelText('totp_code'), '1234');
      await user.click(screen.getByRole('button', { name: 'Verify' }));
    });

    expect(onVerifyTotp).toHaveBeenNthCalledWith(1, '1234');
  });

  it('should forward errors to the totp enrollment box', async () => {
    const { username, fullname, email, abilities } = profileFactory.build();

    const totpSecret = faker.string.uuid();

    const errors = [
      {
        detail: 'Error validating totp code',
        source: { pointer: '/totp_code' },
        title: 'Invalid value',
      },
    ];

    render(
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        totpSecret={totpSecret}
        totpQrData={totpSecret}
        totpBoxOpen
        errors={errors}
      />
    );
    expect(screen.getByText('Error validating totp code')).toBeVisible();
  });

  describe('Single sign on', () => {
    it('should disable fullname, email and username fields', () => {
      const { username, fullname, email, abilities } = profileFactory.build();

      render(
        <ProfileForm
          fullName={fullname}
          emailAddress={email}
          username={username}
          abilities={abilities}
          singleSignOnEnabled
        />
      );

      expect(screen.getByLabelText('fullname')).toBeDisabled();
      expect(screen.getByLabelText('email')).toBeDisabled();
      expect(screen.getByLabelText('username')).toBeDisabled();
      expect(screen.getByLabelText('permissions')).toBeDisabled();
    });

    it('should remove password and totp fields', () => {
      const { username, fullname, email, abilities } = profileFactory.build();

      render(
        <ProfileForm
          fullName={fullname}
          emailAddress={email}
          username={username}
          abilities={abilities}
          singleSignOnEnabled
        />
      );

      expect(screen.queryByText('Password')).not.toBeInTheDocument();
      expect(screen.queryByText('Authenticator App')).not.toBeInTheDocument();
      expect(screen.getByText('Permissions')).toBeVisible();
    });

    it('should remove save button', () => {
      const { username, fullname, email, abilities } = profileFactory.build();

      render(
        <ProfileForm
          fullName={fullname}
          emailAddress={email}
          username={username}
          abilities={abilities}
          singleSignOnEnabled
        />
      );

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });
});
