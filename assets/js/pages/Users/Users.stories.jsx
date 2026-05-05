import React from 'react';
import { action } from 'storybook/actions';
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
      action: 'onDeleteUser',
    },
    navigate: {
      description: 'Function to navigate pages',
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
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    users: [adminUser.build()],
    navigate: action('navigate'),
    loading: false,
    singleSignOnEnabled: false,
    timezone: 'Etc/UTC',
    onDeleteUser: action('onDeleteUser'),
  },
  render: withContainerWrapper,
};

export const Loading = {
  args: {
    ...Default.args,
    loading: true,
  },
  render: withContainerWrapper,
};

export const EmptyUsersTable = {
  render: withContainerWrapper,
};

export const UsersOverview = {
  args: {
    ...Default.args,
    users: [
      adminUser.build(),
      userFactory.build(),
      userFactory.build(),
      userFactory.build(),
      userFactory.build(),
      userFactory.build({ last_login_at: null }),
    ],
  },
  render: withContainerWrapper,
};

export const SingleSignOn = {
  args: {
    ...Default.args,
    singleSignOnEnabled: true,
  },
  render: withContainerWrapper,
};
