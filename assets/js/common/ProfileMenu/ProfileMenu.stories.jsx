import React from 'react';

import { action } from '@storybook/addon-actions';
import ProfileMenu from '.';

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
    username: { control: 'text' },
    email: { control: 'text' },
    logout: { action: 'logout' },
  },
  render: (args) => (
    <ContainerWrapper>
      <ProfileMenu {...args} />
    </ContainerWrapper>
  ),
};

export const Default = {
  args: {
    username: 'John Doe',
    email: 'john@example.com',
    logout: action('logout'),
  },
};
