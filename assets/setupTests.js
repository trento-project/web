// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { mockAnimationsApi } from 'jsdom-testing-mocks';

// Silence the Headless UI warning globally
mockAnimationsApi();

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// jsdom does not implement scrollTo on Elements
globalThis.Element.prototype.scrollTo = function scrollTo() {};
globalThis.Element.prototype.scrollIntoView = function scrollIntoView() {};

const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Web Streams API polyfill for jsdom (used by assistant-ui via assistant-stream)
const {
  TransformStream,
  ReadableStream,
  WritableStream,
} = require('stream/web');

global.TransformStream = TransformStream;
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;

// Fetch API stubs — assistant-stream evaluates `class X extends Response`
// at module load time; we never exercise the network code path in tests,
// so empty-class stubs are enough to satisfy the inheritance.
class FetchStub {}
global.Response = FetchStub;
global.Request = FetchStub;
global.Headers = FetchStub;
global.fetch = () =>
  Promise.reject(new Error('fetch not implemented in tests'));

// Mock Chart.js
jest.mock('chart.js/auto', () => ({
  Chart: jest.fn(),
  registerables: [],
}));

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
  Bar: () => null,
  Pie: () => null,
  Doughnut: () => null,
  Radar: () => null,
  PolarArea: () => null,
  Bubble: () => null,
  Scatter: () => null,
}));
