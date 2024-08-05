import React from 'react';
import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/react';
import { adminUser, userFactory } from '@lib/test-utils/factories/users';
import { renderWithRouter } from '@lib/test-utils';
import { userEvent } from '@testing-library/user-event';
import Users from './Users';

describe('Users', () => {
  it('should render a loading table with a disabled create user button', () => {
    render(<Users loading />);

    const headers = [
      'Username',
      'Full Name',
      'Email',
      'Status',
      'Created',
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
    render(<Users loading={false} />);

    const button = screen.getByRole('button', { name: /Create User/i });
    expect(button).not.toBeDisabled();
    expect(screen.getByText('No data available')).toBeVisible();
  });

  it('should render a table with users', async () => {
    const creationTime = [
      '2024-03-22T16:20:57.801758Z',
      '2024-04-22T16:20:57.801758Z',
    ];
    const expectedCreationTime = ['March 22, 2024', 'April 22, 2024'];
    const admin = adminUser.build({
      enabled: true,
      created_at: creationTime[0],
    });
    const user = userFactory.build({
      enabled: false,
      created_at: creationTime[1],
    });
    const users = [admin, user];

    renderWithRouter(<Users users={users} loading={false} />);

    expect(screen.getByText(admin.username)).toBeVisible();
    expect(screen.getByText(admin.fullname)).toBeVisible();
    expect(screen.getByText(admin.email)).toBeVisible();
    expect(screen.getAllByText('Enabled').length).toBe(1);
    expect(screen.getByText(expectedCreationTime[0])).toBeVisible();

    expect(screen.getByText(user.username)).toBeVisible();
    expect(screen.getByText(user.fullname)).toBeVisible();
    expect(screen.getByText(user.email)).toBeVisible();
    expect(screen.getAllByText('Disabled').length).toBe(1);
    expect(screen.getByText(expectedCreationTime[1])).toBeVisible();

    const toolTipText = 'Admin user cannot be deleted';
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
    await userEvent.hover(deleteButtons[0]);
    expect(await screen.findByText(toolTipText)).toBeVisible();
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
    const modalTitel = screen.getByText(modalHeader);
    expect(modalTitel).toBeInTheDocument();
    await userEvent.click(cancelButton);
    expect(modalTitel).not.toBeInTheDocument();
  });

  describe('Single sign on', () => {
    it('should disable user creation', () => {
      renderWithRouter(<Users users={[]} singleSignOnEnabled />);
      expect(screen.queryByText('Create User')).not.toBeInTheDocument();
    });
  });
});
