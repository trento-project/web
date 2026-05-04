import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { noop } from 'lodash';

import { renderWithRouter } from '@lib/test-utils';
import { hostFactory, relevantPatchFactory } from '@lib/test-utils/factories';
import { DEFAULT_TIMEZONE } from '@lib/timezones';

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

      renderWithRouter(
        <HostRelevantPatchesPage
          hostName={host.hostname}
          patches={[]}
          timezone={DEFAULT_TIMEZONE}
        />
      );
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

      renderWithRouter(
        <HostRelevantPatchesPage
          hostName={host.hostname}
          patches={patches}
          timezone={DEFAULT_TIMEZONE}
        />
      );

      const advisorySelect = screen.getByRole('combobox', {
        name: 'advisories',
      });
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
      renderWithRouter(
        <HostRelevantPatchesPage patches={[]} timezone={DEFAULT_TIMEZONE} />
      );

      expect(screen.getByRole('textbox')).toBeVisible();
    });

    it('shows a button for downloading the data as CSV', () => {
      renderWithRouter(
        <HostRelevantPatchesPage patches={[]} timezone={DEFAULT_TIMEZONE} />
      );

      expect(
        screen.getByRole('button', { name: 'Download CSV' })
      ).toBeVisible();
    });

    it('shows the relevant patches component', () => {
      renderWithRouter(
        <HostRelevantPatchesPage patches={[]} timezone={DEFAULT_TIMEZONE} />
      );

      expect(
        screen.getByRole('row', { name: 'Type Advisory Synopsis Updated' })
      ).toBeVisible();
    });

    it('renders patch update date according to the provided timezone', () => {
      const timezone = 'Pacific/Kiritimati';
      const patch = relevantPatchFactory.build({
        update_date: '2024-01-10T23:30:00.000Z',
        advisory_synopsis: 'timezone test',
      });

      renderWithRouter(
        <HostRelevantPatchesPage
          hostName="host"
          patches={[patch]}
          timezone={timezone}
        />
      );

      expect(screen.getByText('11 Jan 2024')).toBeVisible();
      expect(screen.getByText('timezone test')).toBeVisible();
    });
  });

  describe('filters according to criteria', () => {
    it('shows all patches by default', () => {
      const patches = relevantPatchFactory.buildList(8);

      renderWithRouter(
        <HostRelevantPatchesPage
          patches={patches}
          timezone={DEFAULT_TIMEZONE}
        />
      );

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

      renderWithRouter(
        <HostRelevantPatchesPage
          patches={patches}
          timezone={DEFAULT_TIMEZONE}
        />
      );

      const advisorySelect = screen.getByRole('combobox', {
        name: 'advisories',
      });
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

      const { container } = renderWithRouter(
        <HostRelevantPatchesPage
          patches={patches}
          timezone={DEFAULT_TIMEZONE}
        />
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

      renderWithRouter(
        <HostRelevantPatchesPage
          hostName={hostName}
          patches={patches}
          timezone={DEFAULT_TIMEZONE}
        />
      );

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
          advisory_synopsis: 'lorem ipsum',
          date: '12 oct 1990',
          update_date: '12 oct 1990',
        }),
      ];

      renderWithRouter(
        <HostRelevantPatchesPage
          hostName={hostName}
          patches={patches}
          timezone={DEFAULT_TIMEZONE}
        />
      );

      const csvButton = screen.getByText('Download CSV');
      user.click(csvButton);

      // Note: this only validates the type, we cannot match the content
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(new File([], ''));
      expect(window.URL.createObjectURL).toHaveReturnedWith({
        name: `${hostName}-patches.csv`,
        size: 102,
      });
    });

    afterAll(() => {
      delete window.URL.createObjectURL;
      delete window.URL.revokeObjectURL;
    });
  });
});
