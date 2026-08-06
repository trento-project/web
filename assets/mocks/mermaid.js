// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// mermaid is ESM-only and drags in a browser-only graph stack (d3, dagre,
// cytoscape) that jsdom cannot lay out. Every suite rendering an assistant
// message reaches it through the markdown pipeline, so the stub lives here
// instead of in each spec.
//
// `parse` resolving to `false` is mermaid's own "this is not a diagram"
// answer, so a suite that doesn't opt in gets the plain fenced-code fallback.
// A spec that wants the rendered branch overrides these — `clearMocks` wipes
// calls between tests but leaves implementations in place, so an override has
// to be re-applied per test.
const mermaid = {
  initialize: jest.fn(),
  parse: jest.fn().mockResolvedValue(false),
  render: jest.fn().mockResolvedValue({ svg: '<svg id="stub" />' }),
};

export default mermaid;
