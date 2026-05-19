// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import NotificationBox from './NotificationBox';

export default {
  title: 'Components/NotificationBox',
  component: NotificationBox,
  argTypes: {
    icon: {
      description: 'Icon element or component to display',
    },
    title: {
      description: 'Title text for the component',
      control: { type: 'text' },
    },
    text: {
      description: 'Text content displayed in the component',
      control: { type: 'text' },
    },
    buttonText: {
      description: 'The buttonText prop',
      control: { type: 'text' },
    },
    buttonOnClick: {
      description: 'The buttonOnClick prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    icon: null,
    title: 'Default title',
    text: 'Default text',
  },
};
