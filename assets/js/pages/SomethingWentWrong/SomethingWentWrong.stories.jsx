import React from 'react';
import { BrowserRouter } from 'react-router';
import Component from './SomethingWentWrong';

export default {
  title: 'Components/SomethingWentWrong',
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
