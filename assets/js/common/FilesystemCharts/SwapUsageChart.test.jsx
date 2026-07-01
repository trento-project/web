// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SwapUsageChart from './SwapUsageChart';

describe('SwapUsageChart', () => {
  it('should display total size when swap is configured', () => {
    render(<SwapUsageChart availBytes={2} usedBytes={3} totalBytes={5} />);

    expect(screen.getByText('5 Bytes')).toBeInTheDocument();
  });

  it.each([0, undefined, null])(
    'should display swap is not configured when total bytes is %p',
    (totalBytes) => {
      render(<SwapUsageChart totalBytes={totalBytes} />);

      expect(screen.getByText('Swap Not Configured')).toBeInTheDocument();
    }
  );
});
