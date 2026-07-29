// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import StatusPill from './StatusPill';

describe('StatusPill', () => {
  it('should render passing status correctly', () => {
    render(<StatusPill status="passing">Test Service</StatusPill>);

    const statusPill = screen.getByText('Test Service', { exact: false });
    const svgElement = screen.getByTestId('eos-svg-component');

    expect(statusPill).toHaveTextContent('Reporting');
    expect(statusPill).toContainElement(svgElement);
    expect(svgElement).toHaveClass('fill-jungle-green-500');
  });

  it('should render critical status correctly', () => {
    render(<StatusPill status="critical">Test Service</StatusPill>);

    const statusPill = screen.getByText('Test Service', { exact: false });
    const svgElement = screen.getByTestId('eos-svg-component');

    expect(statusPill).toHaveTextContent('Not reporting');
    expect(statusPill).toContainElement(svgElement);
    expect(svgElement).toHaveClass('fill-red-500');
  });

  it('should render unknown status correctly', () => {
    render(<StatusPill status="unknown">Test Service</StatusPill>);

    expect(
      screen.getByText('Test Service', { exact: false })
    ).toHaveTextContent('Unknown');
  });
});
