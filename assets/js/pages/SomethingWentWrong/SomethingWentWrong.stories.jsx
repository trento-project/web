import React from 'react';
import { BrowserRouter } from 'react-router';
import SomethingWentWrong from '.';

export default {
  title: 'Components/SomethingWentWrong',
  component: SomethingWentWrong,
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
