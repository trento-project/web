// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ApiKeyBox from './ApiKeyBox';

export default {
  title: 'Components/ApiKeyBox',
  component: ApiKeyBox,
  argTypes: {
    apiKey: {
      description: 'The API key to be displayed.',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes for the component.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    apiKey: 'some-api-key',
    className: '',
  },
};
