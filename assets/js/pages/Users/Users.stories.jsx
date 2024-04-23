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
};

export function Default() {
  return <Users />;
}
