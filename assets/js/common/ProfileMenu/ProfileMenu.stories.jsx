import React from 'react';
import { MemoryRouter } from 'react-router';
import ProfileMenu from '.';

import { action } from 'storybook/actions';
function ContainerWrapper({ children }) {
  return (
    <div className="max-w-xs mx-auto px-2 sm:px-4 lg:px-6 flex justify-center h-48">
      {children}
    </div>
  );
}

export default {
  title: 'Components/ProfileMenu',
  component: ProfileMenu,
  argTypes: {
    username: {
      description: 'Username to display in the menu',
      control: { type: 'text' },
    },
    email: {
      description: 'Email address to display in the menu',
      control: { type: 'text' },
    },
    logout: {
      description: 'Callback function invoked when user logs out',
      action: 'logout',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = {
  args: {
    username: 'John Doe',
    email: 'john@example.com',
    logout: action('logout'),
  },
  render: (args) => (
    <ContainerWrapper>
      <ProfileMenu {...args} />
    </ContainerWrapper>
  ),
};
