import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { action } from '@storybook/addon-actions';

import { adminUser, userFactory } from '@lib/test-utils/factories/users';

import Users from './Users';

const mockedNavigate = action('navigate');

function ContainerWrapper({ children }) {
  return (
    <div className="flex flex-wrap max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {children}
    </div>
  );
}

const withContainerWrapper = (args) => (
  <ContainerWrapper>
    <Users {...args} />
  </ContainerWrapper>
);

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
    onDeleteUser: {
      description: 'Function to handle deleting a user',
      control: { type: 'function' },
      action: 'onDeleteUser',
    },
    navigate: {
      description: 'Function to navigate pages',
      control: { type: 'function' },
      action: 'navigate',
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
  args: { users: [adminUser.build()], loading: false },
  render: withContainerWrapper,
};
export const Loading = {
  args: { loading: true },
  render: withContainerWrapper,
};
export const EmptyUsersTable = {
  args: { users: [], loading: false },
  render: withContainerWrapper,
};
export const UsersOverview = {
  args: {
    users: [
      adminUser.build(),
      userFactory.build(),
      userFactory.build(),
      userFactory.build(),
      userFactory.build(),
    ],
    loading: false,
  },
  render: withContainerWrapper,
};
