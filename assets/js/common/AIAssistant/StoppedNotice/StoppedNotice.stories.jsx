// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { StoppedNoticeView } from './StoppedNotice';

export default {
  title: 'Components/AIAssistant/StoppedNotice',
  component: StoppedNoticeView,
  argTypes: {
    children: {
      description: 'Label rendered under a partial answer',
      control: { type: 'text' },
    },
  },
  render: (args) => <StoppedNoticeView>{args.children}</StoppedNoticeView>,
};

export const Stopped = {
  args: { children: 'Response stopped.' },
};
