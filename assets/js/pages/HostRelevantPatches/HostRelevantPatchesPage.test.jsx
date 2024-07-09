import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { noop } from 'lodash';

import { renderWithRouter as render } from '@lib/test-utils';
import { hostFactory, relevantPatchFactory } from '@lib/test-utils/factories';

import HostRelevantPatchesPage from './HostRelevantPatchesPage';

const enhancePatchesWithAdvisoryType = (
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
      const patches = enhancePatchesWithAdvisoryType(
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
          // This tests for uniqueness as well.
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

      const patches = enhancePatchesWithAdvisoryType(
        relevantPatchFactory.buildList(8)
      );

      const filteredType = 'adv-0';
      const expectedPatches = patches.filter(
        (patch) => patch.advisory_type === filteredType
      );

      render(<HostRelevantPatchesPage patches={patches} />);

      const advisorySelect = screen.getByRole('button', { name: 'all' });
      await user.click(advisorySelect);
      const advisoryOption = screen.getByRole('option', { name: filteredType });
      await user.click(advisoryOption);

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

  describe('exports the patches in CSV format', () => {
    beforeAll(() => {
      const createObjectURL = jest.fn(({ name, size }) => ({
        name,
        size,
      }));
      const revokeObjectURL = jest.fn(() => noop());

      window.URL = { createObjectURL, revokeObjectURL };
    });

    it('disables button if no patches are available', () => {
      const hostName = faker.string.uuid();

      const patches = [];

      render(<HostRelevantPatchesPage hostName={hostName} patches={patches} />);

      const csvButton = screen.getByText('Download CSV');

      expect(csvButton).toBeDisabled();
      expect(window.URL.createObjectURL).not.toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
    });

    it('and it does it the right way', () => {
      const user = userEvent.setup();
      const hostName = faker.string.uuid();

      const patches = [
        relevantPatchFactory.build({
          advisory_name: 'carbonara123',
          advisory_type: 'bugfix',
          advisory_status: 'kekw',
          id: 1234,
          advisory_synopsis: 'lorem ipsum',
          date: '12 oct 1990',
          update_date: '12 oct 1990',
        }),
      ];

      render(<HostRelevantPatchesPage hostName={hostName} patches={patches} />);

      const csvButton = screen.getByText('Download CSV');
      user.click(csvButton);

      // Note: this only validates the type, we cannot match the content
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(new File([], ''));
      expect(window.URL.createObjectURL).toHaveReturnedWith({
        name: `${hostName}-patches.csv`,
        size: 110,
      });
    });

    afterAll(() => {
      delete window.URL.createObjectURL;
      delete window.URL.revokeObjectURL;
    });
  });
});
