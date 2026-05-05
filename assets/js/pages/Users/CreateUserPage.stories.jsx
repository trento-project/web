import React from 'react';
import { BrowserRouter } from 'react-router';
import Users from '.';

export default {
  title: 'Components/CreateUserPage',
  component: Users,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {},
};

export const Default = {
  args: {},
};
