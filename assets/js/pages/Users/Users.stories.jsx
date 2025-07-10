import React from 'react';
import { MemoryRouter } from 'react-router';

import { adminUser, userFactory } from '@lib/test-utils/factories/users';

import Users from './Users';

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
    singleSignOnEnabled: {
      description: 'Single sign on login is enabled',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: { users: [adminUser.build()] },
  render: withContainerWrapper,
};
export const Loading = {
  args: { loading: true },
  render: withContainerWrapper,
};
export const EmptyUsersTable = {
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
  },
  render: withContainerWrapper,
};
export const SingleSignOn = {
  args: { singleSignOnEnabled: true },
  render: withContainerWrapper,
};
