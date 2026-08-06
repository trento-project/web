// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

// Deep imports keep the bundle to the languages we register below.
// The package root pulls in every Prism grammar.
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import elixir from 'react-syntax-highlighter/dist/esm/languages/prism/elixir';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import log from 'react-syntax-highlighter/dist/esm/languages/prism/log';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import promql from 'react-syntax-highlighter/dist/esm/languages/prism/promql';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

const LANGUAGES = {
  bash,
  diff,
  elixir,
  ini,
  javascript,
  json,
  log,
  markup,
  promql,
  python,
  sql,
  yaml,
};

// Fence tags the assistant is likely to emit that are not grammar names.
const ALIASES = {
  cfg: 'ini',
  conf: 'ini',
  console: 'bash',
  ex: 'elixir',
  exs: 'elixir',
  html: 'markup',
  js: 'javascript',
  jsx: 'javascript',
  logs: 'log',
  patch: 'diff',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  xml: 'markup',
  yml: 'yaml',
  zsh: 'bash',
};

Object.entries(LANGUAGES).forEach(([name, definition]) => {
  SyntaxHighlighter.registerLanguage(name, definition);
});

// The theme paints the block itself, so these only align it with the
// surrounding `prose` rhythm.
const PRE_STYLE = {
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  lineHeight: '1.5rem',
  margin: '1.25em 0',
  padding: '0.875rem 1rem',
};

export function resolveLanguage(language) {
  const resolved = ALIASES[language] ?? language;

  return LANGUAGES[resolved] ? resolved : null;
}

function CodeBlock({ components: { Pre, Code }, language, code }) {
  const resolved = resolveLanguage(language);
  const source = code.replace(/\n$/, '');

  if (!resolved) {
    return (
      <Pre>
        <Code>{source}</Code>
      </Pre>
    );
  }

  return (
    <SyntaxHighlighter
      language={resolved}
      style={oneDark}
      PreTag={Pre}
      CodeTag={Code}
      customStyle={PRE_STYLE}
    >
      {source}
    </SyntaxHighlighter>
  );
}

export default CodeBlock;
