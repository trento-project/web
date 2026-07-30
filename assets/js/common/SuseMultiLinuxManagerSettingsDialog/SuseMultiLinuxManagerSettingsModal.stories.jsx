// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import SuseMultiLinuxManagerSettingsModal from './SuseMultiLinuxManagerSettingsModal';

export default {
  title: 'Components/SuseMultiLinuxManagerSettingsModal',
  component: SuseMultiLinuxManagerSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: {
        type: 'boolean',
      },
    },
    loading: {
      description: 'Whether the settings are loading or submitting',
      control: {
        type: 'boolean',
      },
    },
    initialUsername: {
      description: 'Initial SUSE Multi-Linux Manager username',
      control: {
        type: 'string',
      },
    },
    initialUrl: {
      description: 'Initial SUSE Multi-Linux Manager URL',
      control: {
        type: 'string',
      },
    },
    certUploadDate: {
      description: 'Certificate upload date',
      control: {
        type: 'date',
      },
    },
    errors: {
      description: 'OpenAPI errors coming from backend validation',
    },
  },
};

export const Default = {
  args: {
    open: false,
  },
};

export const WithPreviousSettings = {
  args: {
    open: false,
    initialUrl: 'https://demo.trento-project.io/smlm',
    initialUsername: 'trentorulez',
    certUploadDate: '2024-01-29T08:41:47.291734Z',
  },
};

export const WithErrors = {
  args: {
    open: false,
    initialUrl: 'https://demo.trento-project.io/smlm',
    initialUsername: 'trentorulez',
    certUploadDate: '2024-01-29T08:41:47.291734Z',
    errors: [
      {
        detail: "can't be blank",
        source: { pointer: '/url' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
    ],
  },
};

export const WithAllErrors = {
  args: {
    open: false,
    errors: [
      {
        detail: "can't be blank",
        source: { pointer: '/url' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/password' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
    ],
  },
};

export const Loading = {
  args: {
    open: false,
    certUploadDate: '2024-01-29T08:41:47.291734Z',
    loading: true,
  },
};
