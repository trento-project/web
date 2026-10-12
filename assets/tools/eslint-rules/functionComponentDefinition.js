// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { merge } from '@eslint-react/kit';

/** Enforce function declarations for function components. */
export function functionComponentDefinition() {
  return (context, { collect, hint }) => {
    const { query, visitor } = collect.components(context, {
      hint:
        hint.component.Default |
        hint.component.DoNotIncludeFunctionDefinedAsObjectMethod,
    });
    return merge(visitor, {
      'Program:exit'(program) {
        for (const { node } of query.all(program)) {
          if (node.type === 'FunctionDeclaration') continue;
          context.report({
            node,
            message:
              'Function components must be defined with function declarations.',
          });
        }
      },
    });
  };
}
