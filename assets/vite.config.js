// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    // We use the `vite-tsconfig-paths` plugin because the
    // `resolve/tsconfigPaths: true` builtin option doesn't work with
    // `jsconfig.json` file. It can potentially be replaced it with
    // `tsconfig.json` with `allowJs: true` option, but we should
    // ensure that all LSP clients can work properly with that setup.
    tsconfigPaths(),
  ],
});
