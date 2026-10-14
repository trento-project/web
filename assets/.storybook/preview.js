// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { jsx as _jsx } from 'react/jsx-runtime';
import { withState } from '@lib/test-utils';

import '../../priv/static/assets/app.css';

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
        return _jsx(Story, {});
      }

      const [StoryWithState] = withState(
        _jsx(Story, {}),
        parameters.storeState,
        true
      );
      return StoryWithState;
    },
  ],
};
