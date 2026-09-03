// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { action } from 'storybook/actions';

import AnalyticsEulaModal from './AnalyticsEulaModal';

export default {
  title: 'Patterns/AnalyticsEulaModal',
  component: AnalyticsEulaModal,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 500,
      },
    },
  },
  argTypes: {
    isOpen: {
      description: 'Sets the visibility of the modal',
    },
    onEnable: {
      description: 'Callback when the Enable button is clicked',
      action: 'callback',
    },
    onCancel: {
      description: 'Callback when the Cancel button is clicked',
      action: 'callback',
    },
  },
  args: {
    isOpen: true,
    onEnable: action('enable clicked'),
    onCancel: action('cancel clicked'),
  },
};

export const Default = {
  args: {
    isOpen: true,
    onEnable: action('enable clicked'),
    onCancel: action('cancel clicked'),
  },
};
