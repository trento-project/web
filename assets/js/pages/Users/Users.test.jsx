import React from 'react';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { adminUser, userFactory } from '@lib/test-utils/factories/users';
import { renderWithRouter } from '@lib/test-utils';
import { userEvent } from '@testing-library/user-event';
import Users from './Users';
import { faker } from '@faker-js/faker';
import { DEFAULT_TIMEZONE } from '@lib/timezones';

describe('Users', () => {
  it('should render a loading table with a disabled create user button', () => {
    renderWithRouter(<Users loading />);

    const headers = [
      'Username',
      'Full Name',
      'Email',
      'Status',
      'Created',
      'Last Login',
      'Actions',
    ];
    headers.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    const button = screen.getByRole('button', { name: /Create User/i });
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeVisible();
  });

  it('should render an empty table with an enabled create user button', () => {
    renderWithRouter(<Users loading={false} />, {
      initialState: { user: { timezone: faker.location.timeZone() } },
    });
    const button = screen.getByRole('button', { name: /Create User/i });
    expect(button).not.toBeDisabled();
    expect(screen.getByText('No data available')).toBeVisible();
  });

  it('should render a table with users', async () => {
    const creationTime = [
      '2024-03-22T16:20:57.801758Z',
      '2024-04-22T16:20:57.801758Z',
    ];
    const expectedCreationTime = ['22 Mar 2024', '22 Apr 2024'];
    const lastLoginTime = [
      '2025-11-26T16:20:57.801758Z',
      '2025-12-26T16:20:57.801758Z',
    ];
    const expectedLastLoginTime = ['26 Nov 2025', '26 Dec 2025'];
    const admin = adminUser.build({
      enabled: true,
      created_at: creationTime[0],
      last_login_at: lastLoginTime[0],
    });
    const user = userFactory.build({
      enabled: false,
      created_at: creationTime[1],
      last_login_at: lastLoginTime[1],
    });
    const users = [admin, user];

    renderWithRouter(
      <Users users={users} loading={false} timezone={DEFAULT_TIMEZONE} />
    );

    expect(screen.getByText(admin.username)).toBeVisible();
    expect(screen.getByText(admin.fullname)).toBeVisible();
    expect(screen.getByText(admin.email)).toBeVisible();
    expect(screen.getAllByText('Enabled').length).toBe(1);
    expect(screen.getByText(expectedCreationTime[0])).toBeVisible();
    expect(screen.getByText(expectedLastLoginTime[0])).toBeVisible();

    expect(screen.getByText(user.username)).toBeVisible();
    expect(screen.getByText(user.fullname)).toBeVisible();
    expect(screen.getByText(user.email)).toBeVisible();
    expect(screen.getAllByText('Disabled').length).toBe(1);
    expect(screen.getByText(expectedCreationTime[1])).toBeVisible();
    expect(screen.getByText(expectedLastLoginTime[1])).toBeVisible();

    const toolTipText = 'Admin user cannot be deleted';
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
    await userEvent.hover(deleteButtons[0]);
    expect(await screen.findByText(toolTipText)).toBeVisible();
  });

  it('should render an empty last login time', () => {
    const users = userFactory.buildList(1, { last_login_at: null });

    renderWithRouter(<Users users={users} loading={false} />);

    const table = screen.getByRole('table');
    expect(table.querySelector('td:nth-child(6)')).toHaveTextContent('-');
  });

  it('should render created and last login dates according to user timezone', () => {
    const createdAt = '2024-01-10T23:30:00.000Z';
    const lastLoginAt = '2024-01-11T23:30:00.000Z';
    const timezone = 'Pacific/Kiritimati';
    const users = [
      userFactory.build({
        created_at: createdAt,
        last_login_at: lastLoginAt,
        enabled: true,
      }),
    ];

    renderWithRouter(
      <Users users={users} loading={false} timezone={timezone} />
    );

    expect(screen.getByText('11 Jan 2024')).toBeVisible();
    expect(screen.getByText('12 Jan 2024')).toBeVisible();
    expect(screen.queryByText('10 Jan 2024')).not.toBeInTheDocument();
  });

  it('should open modal when delete button is pressed and close when cancel button is pressed', async () => {
    const user = userFactory.build();
    const users = [adminUser.build(), user];

    renderWithRouter(<Users users={users} loading={false} />);

    const modalHeader = 'Delete User';
    const bannerText = 'This action cannot be undone.';
    const modalWarningText =
      'Are you sure you want to delete the following user account?';

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
    await userEvent.click(deleteButtons[1]);
    expect(screen.getByText(bannerText)).toBeVisible();
    expect(screen.getByText(modalWarningText)).toBeVisible();
    expect(screen.getAllByText(user.username)[1]).toBeVisible();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const modalTitle = screen.getByText(modalHeader);
    expect(modalTitle).toBeInTheDocument();
    await userEvent.click(cancelButton);
    await waitFor(() => expect(modalTitle).not.toBeInTheDocument());
  });

  describe('Single sign on', () => {
    it('should disable user creation', () => {
      renderWithRouter(<Users users={[]} singleSignOnEnabled />);
      expect(screen.queryByText('Create User')).not.toBeInTheDocument();
    });

    it('should not display last login time information', () => {
      renderWithRouter(<Users users={[]} singleSignOnEnabled />);
      expect(screen.queryByText('Last Login')).not.toBeInTheDocument();
    });
  });
});
