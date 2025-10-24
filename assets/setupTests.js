global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
