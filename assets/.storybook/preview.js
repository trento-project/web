// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import '../../priv/static/assets/app.css';

import React from 'react';
import { withState } from '@lib/test-utils';

export default {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  tags: ['autodocs', 'autodocs'],
  decorators: [
    (Story, { parameters }) => {
      if (!parameters.storeState) {
        return <Story />;
      }

      const [StoryWithState] = withState(
        <Story />,
        parameters.storeState,
        true
      );
      return StoryWithState;
    },
  ],
};
