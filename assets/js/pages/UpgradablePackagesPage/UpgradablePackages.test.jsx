import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter as render } from '@lib/test-utils';
import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';

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
