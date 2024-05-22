import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { format as formatDate } from 'date-fns';

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

    render(<PatchList patches={patches} />);

    patches.forEach((patch) => {
      expect(
        screen.getByText(patch.advisory_synopsis).parentElement.parentElement
          .firstChild.firstChild instanceof SVGElement
      ).toBeTruthy();
      expect(screen.getByText(patch.advisory_name)).toBeVisible();
      expect(screen.getByText(patch.advisory_synopsis)).toBeVisible();
      expect(
        screen.getByText(formatDate(patches[0].update_date, 'd MMM y'))
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
});
