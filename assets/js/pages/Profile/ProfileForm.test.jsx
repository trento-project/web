import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import { abilityFactory } from '@lib/test-utils/factories/users';

import ProfileForm from '@pages/Profile/ProfileForm';

describe('ProfileForm', () => {
  it('should render a pre-filled form', () => {
    const username = faker.internet.userName();
    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const abilities = abilityFactory.buildList(2);

    render(
      <ProfileForm
        fullName={fullName}
        emailAddress={email}
        username={username}
        abilities={abilities}
      />
    );

    expect(screen.getByText('Full Name')).toBeVisible();
    expect(screen.getByLabelText('fullname').value).toBe(fullName);
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
    const username = faker.internet.userName();
    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const abilities = abilityFactory.buildList(2);
    const mockOnSave = jest.fn();

    render(
      <ProfileForm
        fullName={fullName}
        emailAddress={email}
        username={username}
        abilities={abilities}
        onSave={mockOnSave}
      />
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockOnSave).toHaveBeenNthCalledWith(1, {
      fullname: fullName,
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
});
