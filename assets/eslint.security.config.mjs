// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// Security rules live in a separate config on purpose. Adding them to
// eslint.config.mjs would make ci.yaml's `npm run lint` gate fail on existing
// findings, turning a report-only rollout into a blocking one by accident.

import { defineConfig } from 'eslint/config';
import securityPlugin from 'eslint-plugin-security';
import noUnsanitizedPlugin from 'eslint-plugin-no-unsanitized';
import baseConfig from './eslint.config.mjs';

export default defineConfig([
  ...baseConfig,

  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      security: securityPlugin,
      'no-unsanitized': noUnsanitizedPlugin,
    },
    rules: {
      ...securityPlugin.configs.recommended.rules,
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',
    },
  },
]);
