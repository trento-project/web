// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import CopyButton from './CopyButton';

export default {
  title: 'Components/CopyButton',
  component: CopyButton,
  argTypes: {
    content: {
      description: 'Text content to copy',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    content: 'this is a test content',
  },
};
