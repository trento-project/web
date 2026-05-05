// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import SaptuneVersion from './SaptuneVersion';

export default {
  title: 'Components/SaptuneVersion',
  component: SaptuneVersion,
  argTypes: {
    sapPresent: {
      description: 'The sapPresent prop',
      control: { type: 'text' },
    },
    version: {
      description: 'The version prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    sapPresent: true,
    version: '7.3.0',
  },
};
