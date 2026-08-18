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
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
import xmlDoc from 'react-syntax-highlighter/dist/esm/languages/prism/xml-doc';
import plantUml from 'react-syntax-highlighter/dist/esm/languages/prism/plant-uml';
import nginx from 'react-syntax-highlighter/dist/esm/languages/prism/nginx';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import git from 'react-syntax-highlighter/dist/esm/languages/prism/git';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import mermaid from 'react-syntax-highlighter/dist/esm/languages/prism/mermaid';

const LANGUAGES = {
  bash,
  diff,
  docker,
  elixir,
  git,
  go,
  ini,
  javascript,
  json,
  log,
  markup,
  mermaid,
  nginx,
  'plant-uml': plantUml,
  promql,
  python,
  sql,
  toml,
  'xml-doc': xmlDoc,
  yaml,
};

// Fence tags the assistant is likely to emit that are not grammar names.
const ALIASES = {
  cfg: 'ini',
  conf: 'ini',
  console: 'bash',
  containerfile: 'docker',
  dockerfile: 'docker',
  ex: 'elixir',
  exs: 'elixir',
  golang: 'go',
  html: 'markup',
  js: 'javascript',
  jsx: 'javascript',
  logs: 'log',
  mmd: 'mermaid',
  patch: 'diff',
  plantuml: 'plant-uml',
  puml: 'plant-uml',
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

const PRE_STYLE = {
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  lineHeight: '1.5rem',
  margin: '1.25em 0',
  padding: '0.875rem 1rem',
};

export function resolveLanguage(language) {
  const tag = (language || '').toLowerCase();
  const resolved = ALIASES[tag] ?? tag;

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
