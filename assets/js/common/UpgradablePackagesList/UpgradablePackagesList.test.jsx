import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpgradablePackagesList from './UpgradablePackagesList';

describe('UpgradablePackagesList component', () => {
  it('should render the upgradable packages list', () => {
    const hostname = 'Example Host';
    const upgradablePackage = {
      from_epoch: ' ',
      to_release: '150300.3.30.1',
      name: 'openssh-server',
      from_release: '150300.3.15.4',
      to_epoch: ' ',
      arch: 'x86_64',
      to_package_id: 39543,
      from_version: '8.4p1',
      to_version: '8.4p1',
      from_arch: 'x86_64',
      to_arch: 'x86_64',
    };
    const relevantPatch = {
      date: '2023-05-30',
      advisory_name: 'SUSE-15-SP4-2023-2317',
      advisory_type: 'bugfix',
      advisory_status: 'stable',
      id: 39543,
      advisory_synopsis: 'Recommended update for util-linux',
      update_date: '2023-05-30',
    };

    const expectedInstalledPackage = `${upgradablePackage.name}-${upgradablePackage.from_version}-${upgradablePackage.from_release}.${upgradablePackage.arch}`;
    const expectedLatestPackage = `${upgradablePackage.name}-${upgradablePackage.to_version}-${upgradablePackage.to_release}.${upgradablePackage.arch}`;

    render(
      <UpgradablePackagesList
        hostname={hostname}
        upgradablePackages={[upgradablePackage]}
        relevantPatches={[relevantPatch]}
      />
    );

    expect(screen.getByText(hostname)).toBeVisible();
    expect(screen.getByText(expectedInstalledPackage)).toBeVisible();
    expect(screen.getByText(expectedLatestPackage)).toBeVisible();
    expect(screen.getByText(relevantPatch.advisory_name)).toBeVisible();
  });
});
