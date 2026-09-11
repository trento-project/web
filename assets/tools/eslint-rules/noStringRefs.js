// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

/** Disallow deprecated string refs. */
export function noStringRefs() {
  return (context) => ({
    JSXAttribute(node) {
      // Check if this is a ref attribute
      if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'ref') {
        return;
      }

      // Check if the value is a string literal (string ref)
      const value = node.value;
      if (value?.type === 'Literal' && typeof value.value === 'string') {
        context.report({
          node,
          message: `String refs are deprecated and should not be used. Use React.useRef() instead.`,
        });
      }
    },
  });
}
