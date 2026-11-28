// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

// Jest runs tests as CommonJS, where `import.meta` is a syntax error.
export default ({ types: t }) => ({
  visitor: {
    MetaProperty(path) {
      if (path.get('meta').isIdentifier({ name: 'import' })) {
        path.replaceWith(t.objectExpression([]));
      }
    },
  },
});
