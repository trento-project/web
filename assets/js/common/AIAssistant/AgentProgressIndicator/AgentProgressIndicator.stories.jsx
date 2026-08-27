// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { AgentProgressIndicatorView } from './AgentProgressIndicator';

export default {
  title: 'Components/AIAssistant/AgentProgressIndicator',
  component: AgentProgressIndicatorView,
  argTypes: {
    children: {
      description: 'Label rendered next to the spinner',
      control: { type: 'text' },
    },
    spinner: {
      description: 'Whether the agent is still working on the answer',
      control: { type: 'boolean' },
    },
  },
  render: (args) => (
    <AgentProgressIndicatorView spinner={args.spinner}>
      {args.children}
    </AgentProgressIndicatorView>
  ),
};

export const Thinking = {
  args: { children: 'Thinking...', spinner: true },
};

export const CallingTool = {
  args: { children: 'Calling get_hosts...', spinner: true },
};

export const Stopped = {
  args: { children: 'Response stopped.', spinner: false },
};
