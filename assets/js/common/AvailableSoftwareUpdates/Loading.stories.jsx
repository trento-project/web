// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import Loading from './Loading';

export default {
  title: 'Components/Loading',
  component: Loading,
  argTypes: {
    className: {
      description: 'Additional CSS classes for the loading container.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    className: '',
  },
};
