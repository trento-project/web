// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import HealthIcon from '.';

const PASSING_OUTLINED =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z';
const PASSING_FILLED =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
const WARNING_OUTLINED =
  'M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z';
const WARNING_FILLED = 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
const CRITICAL_OUTLINED =
  'M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z';
const CRITICAL_FILLED =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
const PENDING =
  'M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z';
const UNKNOWN =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z';
const NOT_AVAILABLE = 'M19 13H5v-2h14v2z';
const SCHEDULE_OUTLINED =
  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z';

describe('HealthIcon', () => {
  it.each([
    {
      health: 'passing',
      isLink: false,
      icon: PASSING_OUTLINED,
      cssColor: 'fill-jungle-green-500',
    },
    {
      health: 'passing',
      isLink: true,
      icon: PASSING_FILLED,
      cssColor: 'fill-jungle-green-500',
    },
    {
      health: 'warning',
      isLink: false,
      icon: WARNING_OUTLINED,
      cssColor: 'fill-yellow-500',
    },
    {
      health: 'warning',
      isLink: true,
      icon: WARNING_FILLED,
      cssColor: 'fill-yellow-500',
    },
    {
      health: 'critical',
      isLink: false,
      icon: CRITICAL_OUTLINED,
      cssColor: 'fill-red-500',
    },
    {
      health: 'critical',
      isLink: true,
      icon: CRITICAL_FILLED,
      cssColor: 'fill-red-500',
    },
    // For the following the value of `isLink` doesn't matter.
    {
      health: 'unknown',
      isLink: false,
      icon: UNKNOWN,
      cssColor: 'fill-gray-500',
    },
    {
      health: 'not_available',
      isLink: false,
      icon: NOT_AVAILABLE,
      cssColor: 'fill-gray-500',
    },
    {
      health: 'pending',
      isLink: false,
      icon: PENDING,
      cssColor: 'fill-jungle-green-500',
    },
  ])(
    'renders $health with correct icon and color (isLink: $isLink)',
    ({ health, icon, cssColor, isLink }) => {
      render(<HealthIcon health={health} isLink={isLink} />);

      const svg = screen.getByTestId('eos-svg-component');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass(cssColor);
      expect(svg.querySelector('path')).toHaveAttribute('d', icon);
    }
  );

  it.each([
    { health: 'passing', cssColor: 'fill-jungle-green-500' },
    { health: 'warning', cssColor: 'fill-yellow-500' },
    { health: 'critical', cssColor: 'fill-red-500' },
    { health: 'unknown', cssColor: 'fill-gray-500' },
  ])(
    'renders stale $health health with correct icon and color',
    ({ health, cssColor }) => {
      render(<HealthIcon health={health} staleAt="2026-06-15T10:30:00Z" />);

      const svgs = screen.getAllByTestId('eos-svg-component');
      expect(svgs).toHaveLength(2);
      expect(svgs[1].querySelector('path')).toHaveAttribute(
        'd',
        SCHEDULE_OUTLINED
      );
      expect(svgs[1]).toHaveClass(cssColor);
    }
  );

  it.each([
    { health: 'passing' },
    { health: 'warning' },
    { health: 'critical' },
    { health: 'unknown' },
  ])(
    'shows a tooltip with staleAt timestamp for $health health',
    async ({ health }) => {
      const user = userEvent.setup();
      render(<HealthIcon health={health} staleAt="2026-06-15T10:30:00Z" />);

      const svgs = screen.getAllByTestId('eos-svg-component');
      const healthSvg = svgs[0];
      await user.hover(healthSvg);

      const tooltip = document.querySelector('.rc-tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Stale since 15 Jun 2026, 10:30:00');
    }
  );

  it.each([
    { health: 'passing' },
    { health: 'warning' },
    { health: 'critical' },
    { health: 'unknown' },
    { health: 'not_available' },
    { health: 'pending' },
  ])(
    "does not show a tooltip for $health health when it's not stale",
    async ({ health }) => {
      const user = userEvent.setup();
      render(<HealthIcon health={health} />);

      const healthSvg = screen.getByTestId('eos-svg-component');
      await user.hover(healthSvg);

      const tooltip = document.querySelector('.rc-tooltip');
      expect(tooltip).not.toBeInTheDocument();
    }
  );

  it.each([
    { hoverOpacity: true, cssClass: 'hover:opacity-75' },
    { hoverOpacity: false, cssClass: 'hover:opacity-100' },
  ])(
    'has the right opacity on hover when the corresponding property is $hoverOpacity',
    ({ hoverOpacity, cssClass }) => {
      render(<HealthIcon health="passing" hoverOpacity={hoverOpacity} />);

      const svg = screen.getByTestId('eos-svg-component');
      expect(svg).toHaveClass(cssClass);
    }
  );

  it('should display the icon with the applied size', () => {
    render(<HealthIcon health="passing" size="m" />);

    const svg = screen.getByTestId('eos-svg-component');
    expect(svg).toHaveAttribute('width', '18');
  });
});
