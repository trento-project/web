import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import UpgradablePackagesList from './UpgradablePackagesList';

describe('UpgradablePackagesList component', () => {
  it('should render the upgradable packages list', () => {
    const upgradablePackage = upgradablePackageFactory.build();
    const { patches } = upgradablePackage;

    const expectedInstalledPackage = `${upgradablePackage.name}-${upgradablePackage.from_version}-${upgradablePackage.from_release}.${upgradablePackage.arch}`;
    const expectedLatestPackage = `${upgradablePackage.name}-${upgradablePackage.to_version}-${upgradablePackage.to_release}.${upgradablePackage.arch}`;

    render(<UpgradablePackagesList upgradablePackages={[upgradablePackage]} />);

    expect(screen.getByText(expectedInstalledPackage)).toBeVisible();
    expect(screen.getByText(expectedLatestPackage)).toBeVisible();
    patches.forEach(({ advisory }) => {
      expect(screen.getByText(advisory)).toBeVisible();
    });
  });
});
