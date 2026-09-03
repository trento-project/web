// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DetailsViewHeader } from '.';
import '@testing-library/jest-dom';

describe('DetailsViewHeader', () => {
  it('should render a header with the correct text and health', () => {
    render(<DetailsViewHeader health="passing">Hello World</DetailsViewHeader>);
    expect(screen.getByText('Hello World')).toBeVisible();
    expect(screen.getByTestId('eos-svg-component')).toHaveClass(
      'fill-jungle-green-500'
    );
  });

  it('should render a stale state', () => {
    const staleAt = '2026-06-15T10:30:00Z';
    const timezone = 'America/New_York';

    render(
      <DetailsViewHeader health="passing" staleAt={staleAt} timezone={timezone}>
        Stale Resource
      </DetailsViewHeader>
    );

    expect(screen.getByText('Stale Resource')).toBeVisible();
    const svgs = screen.getAllByTestId('eos-svg-component');
    expect(svgs).toHaveLength(2);
  });
});
