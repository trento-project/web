// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import Features from './Features';

export default {
  title: 'Components/Features',
  component: Features,
  argTypes: {
    features: {
      description: 'Pipe-separated list of features',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    features: 'Example feature 1|Example feature 2|Example feature 3',
  },
};
