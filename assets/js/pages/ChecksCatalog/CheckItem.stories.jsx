// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import CheckItem from './CheckItem';

export default {
  title: 'Components/CheckItem',
  component: CheckItem,
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
    },
    description: {
      description: 'The description prop',
      control: { type: 'text' },
    },
    remediation: {
      description: 'The remediation prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    checkID: 'check_001',
    targetType: 'host',
    description: 'This check verifies that the system is properly configured',
    remediation: 'Update the configuration according to best practices',
  },
};

export const Cluster = {
  args: {
    ...Default.args,
    checkID: 'check_cluster_001',
    targetType: 'cluster',
    description: 'Cluster-level configuration check',
    remediation: 'Apply the recommended cluster settings',
  },
};
