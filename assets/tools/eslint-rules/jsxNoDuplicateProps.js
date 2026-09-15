// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

/** Options have the format:
JsxNoDuplicatePropsOptions = {
  ignoreCase?: boolean;
};
*/

/** Disallow duplicate properties in JSX. */
export function jsxNoDuplicateProps(options = {}) {
  const { ignoreCase = false } = options;
  return (context) => ({
    JSXOpeningElement(node) {
      const seen = new Map();

      for (const attr of node.attributes) {
        if (attr.type !== 'JSXAttribute') continue;
        if (attr.name.type !== 'JSXIdentifier') continue;

        const name = ignoreCase ? attr.name.name.toLowerCase() : attr.name.name;

        // Report duplicate
        if (seen.has(name)) {
          context.report({
            node: attr,
            message: `Duplicate prop "${attr.name.name}" found.`,
          });
        } else {
          seen.set(name, attr.name.name);
        }
      }
    },
  });
}
