import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { action } from '@storybook/addon-actions';

import Users from './Users';

const mockedNavigate = action('navigate');

export default {
  title: 'Layouts/Users',
  component: Users,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    reactRouter: {
      useNavigate: () => mockedNavigate,
    },
  },
  argTypes: {
    handleDeleteUser: {
      description: 'Function to handle deleting a user',
      control: { type: 'function' },
      action: 'handleDeleteUser',
    },
    navigate: {
      description: 'Function to navigate pages',
      control: { type: 'function' },
      action: 'navigate',
    },
    setModalOpen: {
      description: 'Function to set the modal open state',
      control: { type: 'function' },
      action: 'setModalOpen',
    },
    setDeleteUserId: {
      description: 'Function to set the user ID to delete',
      control: { type: 'function' },
      action: 'setDeleteUserId',
    },
    deleteUserId: {
      description: 'Current user ID marked for deletion',
      control: { type: 'number' },
    },
    modalOpen: {
      description: 'Boolean to show or hide the modal',
      control: { type: 'boolean' },
    },
    users: {
      description: 'Array of users',
      control: { type: 'object' },
    },
    loading: {
      description: 'Display loading state of the component',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    users: [
      {
        id: 1,
        username: 'admin',
        fullname: 'Administrator',
        email: 'admin@example.com',
        enabled: 'Enabled',
        created: 'January 1, 2020',
      },
    ],
  },
};

export const Loading = {
  args: {
    loading: true,
  },
};
export const EmptyUsersTable = {
  args: {
    users: [],
  },
};

export const UsersOverview = {
  args: {
    users: [
      {
        id: 1,
        username: 'admin',
        fullname: 'Administrator',
        email: 'admin@example.com',
        enabled: 'Enabled',
        created: 'January 1, 2020',
      },
      {
        id: 2,
        username: 'user02',
        fullname: 'User Two',
        email: 'user02@example.com',
        enabled: 'Disabled',
        created: 'February 1, 2020',
      },
    ],
  },
};
