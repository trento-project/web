import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter as render } from '@lib/test-utils';
import { hostFactory, relevantPatchFactory } from '@lib/test-utils/factories';

import HostRelevantPatchesPage from './HostRelevantPatchesPage';

const enhancePachesWithAdvisoryType = (
  patches,
  { amount = 2, prefix = 'adv' } = {}
) =>
  patches.map((patch, index) => ({
    ...patch,
    advisory_type: `${prefix}-${index % Math.floor(patches.length / amount)}`,
  }));

describe('HostRelevantPatchesPage', () => {
  describe('renders relevant information correctly', () => {
    it('displays the hostname', () => {
      const host = hostFactory.build();

      render(<HostRelevantPatchesPage hostName={host.hostname} patches={[]} />);
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
        <HostRelevantPatchesPage hostName={host.hostname} patches={patches} />
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
      render(<HostRelevantPatchesPage patches={[]} />);

      expect(screen.getByRole('textbox')).toBeVisible();
    });

    it('shows a button for downloading the data as CSV', () => {
      render(<HostRelevantPatchesPage patches={[]} />);

      expect(
        screen.getByRole('button', { name: 'Download CSV' })
      ).toBeVisible();
    });

    it('shows the relevant patches component', () => {
      render(<HostRelevantPatchesPage patches={[]} />);

      expect(
        screen.getByRole('row', { name: 'Type Advisory Synopsis Updated' })
      ).toBeVisible();
    });
  });

  describe('filters according to criteria', () => {
    it('shows all patches by default', () => {
      const patches = relevantPatchFactory.buildList(8);

      render(<HostRelevantPatchesPage patches={patches} />);

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

      render(<HostRelevantPatchesPage patches={patches} />);

      const advisoryselect = screen.getByRole('button', { name: 'all' });
      await user.click(advisoryselect);
      const advisoryoption = screen.getByRole('option', { name: filteredType });
      await user.click(advisoryoption);

      expectedPatches.forEach((patch) => {
        expect(screen.getByText(patch.advisory_synopsis)).toBeVisible();
      });
    });

    it('should filter patch by content', async () => {
      const user = userEvent.setup();

      const patches = relevantPatchFactory.buildList(8);
      const searchTerm = patches[0].advisory_synopsis;

      const { container } = render(
        <HostRelevantPatchesPage patches={patches} />
      );

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);
      await user.type(searchInput, searchTerm);

      const tableRows = container.querySelectorAll('tbody > tr');

      expect(tableRows.length).toBe(1);
    });
  });
});
