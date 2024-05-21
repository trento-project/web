import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpgradablePackagesList from './UpgradablePackagesList';

describe('UpgradablePackagesList component', () => {
  it('should render the upgradable packages list', () => {
    const hostname = 'Example Host';
    const patches = [
      {
        issue_date: '2024-03-13',
        last_modified_date: '2024-03-13',
        advisory: 'SUSE-15-SP4-2024-870',
        type: 'security_advisory',
        synopsis: 'moderate: Security update for glibc',
        update_date: '2024-03-13',
      },
      {
        issue_date: '2024-02-28',
        last_modified_date: '2024-02-28',
        advisory: 'SUSE-15-SP4-2024-641',
        type: 'bugfix',
        synopsis: 'Recommended update for gcc7',
        update_date: '2024-02-28',
      },
    ];
    const upgradablePackage = {
      from_epoch: ' ',
      to_release: '150400.6.10.1',
      name: 'libQt5Gui5',
      from_release: '150400.6.3.1',
      to_epoch: ' ',
      arch: 'x86_64',
      to_package_id: 38391,
      from_version: '5.15.2+kde294',
      to_version: '5.15.2+kde294',
      from_arch: 'x86_64',
      to_arch: 'x86_64',
      patches,
    };

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
    patches.forEach(({ advisory }) => {
      expect(screen.getByText(advisory)).toBeVisible();
    });
  });
});
