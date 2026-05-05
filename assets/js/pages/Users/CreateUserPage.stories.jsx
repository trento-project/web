import React from 'react';
import { BrowserRouter } from 'react-router';

import CreateUserPage from './CreateUserPage';

export default {
  title: 'Components/CreateUserPage',
  component: CreateUserPage,
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
