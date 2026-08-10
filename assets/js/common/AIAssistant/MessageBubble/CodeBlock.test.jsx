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
    ['an upper case grammar', 'JSON', 'json'],
    ['a mixed case grammar', 'Yaml', 'yaml'],
    ['an upper case alias', 'SH', 'bash'],
    ['a truncated hyphenated tag', 'shell', 'bash'],
    ['a hyphenated grammar', 'plant-uml', 'plant-uml'],
    ['an alias of a hyphenated grammar', 'plantuml', 'plant-uml'],
    ['a shorthand alias', 'puml', 'plant-uml'],
    ['a filename alias', 'dockerfile', 'docker'],
    ['a runtime alias', 'golang', 'go'],
    ['a diagram grammar', 'mermaid', 'mermaid'],
    ['a diagram extension alias', 'mmd', 'mermaid'],
    ['a grammar we do not register', 'brainfuck', null],
    ['an empty tag', '', null],
    ['a missing tag', undefined, null],
    ['a null tag', null, null],
  ])('resolves %s', (_name, language, expected) => {
    expect(resolveLanguage(language)).toBe(expected);
  });
});

describe('CodeBlock', () => {
  it.each([
    ['a registered language', 'json'],
    ['a language tagged in upper case', 'JSON'],
  ])('highlights %s', (_name, language) => {
    const { getByTestId } = renderCodeBlock(language, '{"answer": 42}\n');

    expect(getByTestId('pre')).toHaveTextContent('{"answer": 42}');
  });

  it('falls back to a plain block for an unsupported language', () => {
    const { getByTestId } = renderCodeBlock('unknown', 'plain text\n');

    expect(getByTestId('code')).toHaveTextContent('plain text');
  });
});
