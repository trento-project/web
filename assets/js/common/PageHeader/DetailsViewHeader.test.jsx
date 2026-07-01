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
});
