import React from 'react';
import { BrowserRouter } from 'react-router';
import Component from './CreateUserPage';

export default {
  title: 'Components/CreateUserPage',
  component: Component,
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
