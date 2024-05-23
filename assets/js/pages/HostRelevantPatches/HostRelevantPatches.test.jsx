import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter as render } from '@lib/test-utils';
import { hostFactory, relevantPatchFactory } from '@lib/test-utils/factories';

import HostRelevantPatches from './HostRelevantPatches';

const enhancePachesWithAdvisoryType = (
  patches,
  { amount = 2, prefix = 'adv' } = {}
) =>
  patches.map((patch, index) => ({
    ...patch,
    advisory_type: `${prefix}-${index % Math.floor(patches.length / amount)}`,
  }));

describe('HostRelevantPatches', () => {
  describe('renders relevant information correctly', () => {
    it('displays the hostname', () => {
      const host = hostFactory.build();

      render(<HostRelevantPatches hostName={host.hostname} patches={[]} />);
      expect(
        screen.getByRole('heading', {
          name: `Relevant Patches: ${host.hostname}`,
        })
      ).toBeVisible();
    });

    it('shows all unique advisory types to select from', async () => {
      const host = hostFactory.build();
      const patches = enhancePachesWithAdvisoryType(
        relevantPatchFactory.buildList(8)
      );
      const user = userEvent.setup();

      render(
        <HostRelevantPatches hostName={host.hostname} patches={patches} />
      );

      const advisorySelect = screen.getByRole('button', { name: 'all' });
      await user.click(advisorySelect);

      expect(screen.getByRole('option', { name: 'all' })).toBeVisible();

      Array.from(new Set(patches.map((patch) => patch.advisory_type))).forEach(
        (advisoryType) => {
          // This tests for uniqeness as well.
          expect(
            screen.getByRole('option', { name: advisoryType })
          ).toBeVisible();
        }
      );
    });

    it('shows an input for searching the patches', () => {
      render(<HostRelevantPatches patches={[]} />);

      expect(screen.getByRole('textbox')).toBeVisible();
    });

    it('shows a button for downloading the data as CSV', () => {
      render(<HostRelevantPatches patches={[]} />);

      expect(
        screen.getByRole('button', { name: 'Download CSV' })
      ).toBeVisible();
    });

    it('shows the relevant patches component', () => {
      render(<HostRelevantPatches patches={[]} />);

      expect(
        screen.getByRole('row', { name: 'Type Advisory Synopsis Updated' })
      ).toBeVisible();
    });
  });

  describe('filters according to criteria', () => {
    it('shows all patches by default', () => {
      const patches = relevantPatchFactory.buildList(8);

      render(<HostRelevantPatches patches={patches} />);

      patches.forEach((patch) => {
        expect(screen.getByText(patch.advisory_synopsis)).toBeVisible();
      });
    });
    it('only shows the selected patch kind', async () => {
      const user = userEvent.setup();

      const patches = enhancePachesWithAdvisoryType(
        relevantPatchFactory.buildList(8)
      );

      const filteredType = 'adv-0';
      const expectedPatches = patches.filter(
        (patch) => patch.advisory_type === filteredType
      );

      render(<HostRelevantPatches patches={patches} />);

      const advisorySelect = screen.getByRole('button', { name: 'all' });
      await user.click(advisorySelect);
      const advisoryOption = screen.getByRole('option', { name: filteredType });
      await user.click(advisoryOption);

      expectedPatches.forEach((patch) => {
        expect(screen.getByText(patch.advisory_synopsis)).toBeVisible();
      });
    });
  });
});
