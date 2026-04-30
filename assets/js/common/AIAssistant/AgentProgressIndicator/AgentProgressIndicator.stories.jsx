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
  },

  render: (args) => (
    <AgentProgressIndicatorView>{args.children}</AgentProgressIndicatorView>
  ),
};

export const Thinking = {
  args: { children: 'Thinking...' },
};

export const CallingTool = {
  args: { children: 'Calling get_hosts...' },
};
