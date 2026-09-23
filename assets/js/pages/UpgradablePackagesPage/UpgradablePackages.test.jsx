// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { noop } from 'lodash';
import { faker } from '@faker-js/faker';
import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import { renderWithRouter as render } from '@lib/test-utils';
import { readViewSetting, writeViewSetting } from '@lib/viewSettings';

import UpgradablePackages from './UpgradablePackages';

describe('UpgradablePackages', () => {
  beforeEach(() => {
    // Restore filter settings
    window.sessionStorage.clear();
  });

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

  it('should restore the stored items per page when landing on a bare url', async () => {
    const packages = upgradablePackageFactory.buildList(15);

    writeViewSetting('hostUpgradablePackages', 'itemsPerPage=20');

    const { container } = render(
      <UpgradablePackages upgradablePackages={packages} />,
      { route: '/hosts/host1/packages' }
    );

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);

      expect(params.get('itemsPerPage')).toEqual('20');
    });

    expect(container.querySelectorAll('tbody > tr')).toHaveLength(15);
  });

  it('should let the items per page in the url win over the stored one', async () => {
    const packages = upgradablePackageFactory.buildList(15);

    writeViewSetting('hostUpgradablePackages', 'itemsPerPage=50');

    const { container } = render(
      <UpgradablePackages upgradablePackages={packages} />,
      { route: '/hosts/host1/packages?itemsPerPage=10' }
    );

    await waitFor(() =>
      expect(container.querySelectorAll('tbody > tr')).toHaveLength(10)
    );

    await waitFor(() =>
      expect(readViewSetting('hostUpgradablePackages')).toEqual(
        'itemsPerPage=10'
      )
    );
  });

  it('should store the selected items per page', async () => {
    const user = userEvent.setup();
    const packages = upgradablePackageFactory.buildList(15);

    render(<UpgradablePackages upgradablePackages={packages} />, {
      route: '/hosts/host1/packages',
    });

    await user.click(screen.getByRole('combobox', { name: 'per-page' }));
    await user.click(screen.getByRole('option', { name: '50' }));

    await waitFor(() =>
      expect(readViewSetting('hostUpgradablePackages')).toEqual(
        'itemsPerPage=50'
      )
    );
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
});
