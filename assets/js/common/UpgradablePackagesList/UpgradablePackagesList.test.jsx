import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import UpgradablePackagesList from './UpgradablePackagesList';

describe('UpgradablePackagesList component', () => {
  it('should render the upgradable packages list', () => {
    const hostname = faker.company.buzzNoun();
    const upgradablePackage = upgradablePackageFactory.build();
    const { patches } = upgradablePackage;

    const expectedInstalledPackage = `${upgradablePackage.name}-${upgradablePackage.from_version}-${upgradablePackage.from_release}.${upgradablePackage.arch}`;
    const expectedLatestPackage = `${upgradablePackage.name}-${upgradablePackage.to_version}-${upgradablePackage.to_release}.${upgradablePackage.arch}`;

    render(
      <UpgradablePackagesList
        hostname={hostname}
        upgradablePackages={[upgradablePackage]}
      />
    );

    expect(screen.getByText(hostname)).toBeVisible();
    expect(screen.getByText(expectedInstalledPackage)).toBeVisible();
    expect(screen.getByText(expectedLatestPackage)).toBeVisible();
    patches.forEach(({ advisory_name }) => {
      expect(screen.getByText(advisory_name)).toBeVisible();
    });
  });
});
