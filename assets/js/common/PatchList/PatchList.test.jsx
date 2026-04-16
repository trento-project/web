import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { format as formatDate } from 'date-fns';
import { tz } from '@date-fns/tz';
import {
  DEFAULT_TIMEZONE,
  DATE_DAY_MONTH_YEAR_COMPACT_FORMAT,
} from '@lib/timezones';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import PatchList from '.';

describe('PatchList', () => {
  it('renders the content correctly', () => {
    const patches = [
      relevantPatchFactory.build({
        advisory_type: 'security_advisory',
      }),
      relevantPatchFactory.build({
        advisory_type: 'bugfix',
      }),
      relevantPatchFactory.build({
        advisory_type: 'enhancement',
      }),
    ];

    render(<PatchList patches={patches} timezone={DEFAULT_TIMEZONE} />);

    patches.forEach((patch) => {
      expect(
        screen.getByText(patch.advisory_synopsis).parentElement.parentElement
          .firstChild.firstChild instanceof SVGElement
      ).toBeTruthy();
      expect(screen.getByText(patch.advisory_name)).toBeVisible();
      expect(screen.getByText(patch.advisory_synopsis)).toBeVisible();
      expect(
        screen.getByText(
          formatDate(patch.update_date, DATE_DAY_MONTH_YEAR_COMPACT_FORMAT, {
            in: tz(DEFAULT_TIMEZONE),
          })
        )
      ).toBeVisible();
    });
  });

  it('shows no icon for an unknown advisory type', () => {
    const patchUnknownAdvisoryType = [
      relevantPatchFactory.build({
        advisory_type: '',
      }),
    ];

    render(<PatchList patches={patchUnknownAdvisoryType} />);

    expect(
      screen.getByText(patchUnknownAdvisoryType[0].advisory_synopsis)
        .parentElement.parentElement.firstChild.firstChild
    ).toBeNull();
  });

  it('renders update date using provided non-default timezone', () => {
    const timezone = 'Pacific/Kiritimati';
    const patch = relevantPatchFactory.build({
      update_date: '2024-01-10T23:30:00.000Z',
    });

    render(<PatchList patches={[patch]} timezone={timezone} />);

    expect(screen.getByText('11 Jan 2024')).toBeVisible();
  });
});
