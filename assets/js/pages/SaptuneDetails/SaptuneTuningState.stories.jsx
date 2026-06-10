// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import SaptuneTuningState from './SaptuneTuningState';

export default {
  title: 'Components/SaptuneTuningState',
  component: SaptuneTuningState,
  argTypes: {
    state: {
      description: 'Saptune tuning state',
      control: { type: 'select' },
      options: ['compliant', 'not compliant', 'not tuned'],
    },
  },
};

export const Default = {
  args: {
    state: 'compliant',
  },
};

export const NotCompliant = {
  args: {
    ...Default.args,
    state: 'not compliant',
  },
};

export const NotTuned = {
  args: {
    ...Default.args,
    state: 'not tuned',
  },
};
