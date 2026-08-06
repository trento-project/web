// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import CodeBlock, { resolveLanguage } from './CodeBlock';

// Stand-ins for the `Pre`/`Code` overrides `MarkdownTextPrimitive` hands to a
// `SyntaxHighlighter` component — bare elements that forward every prop.
const COMPONENTS = {
  Pre: (props) => <pre data-testid="pre" {...props} />,

  Code: (props) => <code data-testid="code" {...props} />,
};

const renderCodeBlock = (language, code) =>
  render(<CodeBlock components={COMPONENTS} language={language} code={code} />);

describe('resolveLanguage', () => {
  it.each([
    ['a registered grammar', 'yaml', 'yaml'],
    ['an alias', 'sh', 'bash'],
    ['an extension alias', 'yml', 'yaml'],
  ])('resolves %s', (_name, language, expected) => {
    expect(resolveLanguage(language)).toBe(expected);
  });

  it.each([
    // `CodeOverride` sends this when the fence carries no language tag.
    ['an untagged fence', 'unknown'],
    ['a grammar we do not register', 'brainfuck'],
  ])('returns null for %s', (_name, language) => {
    expect(resolveLanguage(language)).toBeNull();
  });
});

describe('CodeBlock', () => {
  it('highlights a registered language', () => {
    const { getByTestId } = renderCodeBlock('json', '{"answer": 42}\n');

    // The theme paints one <span> per token; plain text would give none.
    expect(getByTestId('code').querySelectorAll('span').length).toBeGreaterThan(
      0
    );
    expect(getByTestId('pre')).toHaveTextContent('{"answer": 42}');
  });

  it('falls back to a plain block for an unsupported language', () => {
    const { getByTestId } = renderCodeBlock('unknown', 'plain text\n');

    expect(getByTestId('code')).toHaveTextContent('plain text');
    expect(getByTestId('code').querySelectorAll('span')).toHaveLength(0);
  });

  it.each([
    ['highlighted', 'json', '{}\n'],
    ['plain', 'unknown', 'plain\n'],
  ])(
    'drops the fence trailing newline in a %s block',
    (_name, language, code) => {
      const { getByTestId } = renderCodeBlock(language, code);

      expect(getByTestId('pre').textContent).toBe(code.trimEnd());
    }
  );
});
