import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { noop } from 'lodash';
import { faker } from '@faker-js/faker';
import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import { patchForPackageFactory } from '@lib/test-utils/factories/relevantPatches';
import { renderWithRouter as render } from '@lib/test-utils';

import UpgradablePackages from './UpgradablePackages';

describe('UpgradablePackages', () => {
  it('shows all packages by default', () => {
    const packages = upgradablePackageFactory.buildList(8);

    const { container } = render(
      <UpgradablePackages upgradablePackages={packages} />
    );

    const tableRows = container.querySelectorAll('tbody > tr');

    expect(tableRows.length).toBe(8);
  });

  it('should filter package by its name', async () => {
    const user = userEvent.setup();

    const packages = upgradablePackageFactory.buildList(8);
    const searchTerm = packages[0].name;

    const { container } = render(
      <UpgradablePackages upgradablePackages={packages} />
    );

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);
    await user.type(searchInput, searchTerm);

    const tableRows = container.querySelectorAll('tbody > tr');

    expect(tableRows.length).toBe(1);
  });
});

describe('exports the packages in CSV format', () => {
  beforeAll(() => {
    const createObjectURL = jest.fn(({ name, size }) => ({
      name,
      size,
    }));
    const revokeObjectURL = jest.fn(() => noop());

    window.URL = { createObjectURL, revokeObjectURL };
  });

  it('disables button if no packages are available', () => {
    const hostName = faker.string.uuid();

    const upgradablePackages = [];
    const patchesLoading = false;

    render(
      <UpgradablePackages
        hostName={hostName}
        upgradablePackages={upgradablePackages}
        patchesLoading={patchesLoading}
      />
    );

    const csvButton = screen.getByText('Download CSV');

    expect(csvButton).toBeDisabled();
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('exports the packages in CSV format', () => {
    const user = userEvent.setup();
    const hostName = faker.string.uuid();
    const upgradablePackage = [
      upgradablePackageFactory.build({
        name: 'elixir',
        arch: 'x86_64',
        to_package_id: 92348112636,
        to_epoch: '0',
        from_epoch: '0',
        from_release: '3',
        from_version: '1.15.7',
        to_release: '1',
        to_version: '1.16.2',
        patches: ['SUSE-15-SP4-2024-630,SUSE-15-SP4-2024-619'],
      }),
    ];
    const patchesLoading = false;

    render(
      <UpgradablePackages
        hostName={hostName}
        upgradablePackages={upgradablePackage}
        patchesLoading={patchesLoading}
      />
    );

    const csvButton = screen.getByText('Download CSV');
    user.click(csvButton);

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(new File([], ''));
    expect(window.URL.createObjectURL).toHaveReturnedWith({
      name: `${hostName}-upgradable-packages.csv`,
      size: 88,
    });
  });

  afterAll(() => {
    delete window.URL.createObjectURL;
    delete window.URL.revokeObjectURL;
  });

  it('sorts the packages alphabetically in the CSV', async () => {
    const user = userEvent.setup();
    const hostName = faker.string.uuid();
    const firstUpgradablePackage = upgradablePackageFactory.build({
      name: 'zlib',
      from_version: '1.2.11',
      from_release: '1',
      arch: 'x86_64',
      to_version: '3',
      to_release: '4',
      patches: [
        patchForPackageFactory.build({
          advisory: 'SUSE-15-SP4-2024-123',
        }),
      ],
    });
    const secondUpgradablePackage = upgradablePackageFactory.build({
      name: 'elixir',
      from_version: '1.2.11',
      from_release: '1',
      arch: 'x86_64',
      to_version: '3',
      to_release: '4',
      patches: [
        patchForPackageFactory.build({
          advisory: 'SUSE-15-SP4-2024-630',
        }),
      ],
    });

    const upgradablePackage = [firstUpgradablePackage, secondUpgradablePackage];
    const csvHeader = 'installed_package,latest_package,patches';
    const firstCsvEntry = `${secondUpgradablePackage.name}-${secondUpgradablePackage.from_version}-${secondUpgradablePackage.from_release}.${secondUpgradablePackage.arch},${secondUpgradablePackage.name}-${secondUpgradablePackage.to_version}-${secondUpgradablePackage.to_release}.${secondUpgradablePackage.arch},${secondUpgradablePackage.patches[0].advisory}`;
    const secondCsvEntry = `${firstUpgradablePackage.name}-${firstUpgradablePackage.from_version}-${firstUpgradablePackage.from_release}.${firstUpgradablePackage.arch},${firstUpgradablePackage.name}-${firstUpgradablePackage.to_version}-${firstUpgradablePackage.to_release}.${firstUpgradablePackage.arch},${firstUpgradablePackage.patches[0].advisory}`;
    const expectedCsvData = [csvHeader, firstCsvEntry, secondCsvEntry].join(
      '\n'
    );

    const patchesLoading = false;
    render(
      <UpgradablePackages
        hostName={hostName}
        upgradablePackages={upgradablePackage}
        patchesLoading={patchesLoading}
      />
    );

    const csvButton = screen.getByText('Download CSV');
    user.click(csvButton);
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(new File([], ''));

    const mockCreateObjectURL = jest.spyOn(window.URL, 'createObjectURL');
    mockCreateObjectURL.mockReturnValue('mocked-url');
    await waitFor(() => expect(mockCreateObjectURL).toHaveBeenCalled(), {
      timeout: 1000,
    });
    const csvObj = mockCreateObjectURL.mock.calls[0][0];
    const reader = new FileReader();
    reader.readAsText(csvObj);
    await new Promise((resolve) => {
      reader.onloadend = resolve;
    });
    expect(reader.result).toBe(expectedCsvData);
    mockCreateObjectURL.mockRestore();
    // test if expected output is same as content of csv after clicking
  });

  afterAll(() => {
    delete window.URL.createObjectURL;
    delete window.URL.revokeObjectURL;
  });
});
