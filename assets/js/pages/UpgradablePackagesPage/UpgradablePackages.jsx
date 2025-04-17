import React, { useState, useEffect } from 'react';
import { EOS_SEARCH } from 'eos-icons-react';
import { noop } from 'lodash';
import Papa from 'papaparse';

import UpgradablePackagesList from '@common/UpgradablePackagesList';
import PageHeader from '@common/PageHeader';
import Input from '@common/Input';
import Button from '@common/Button';
import { containsSubstring } from '@lib/filter';

const sortCsvContent = (content, sortingDirection) => {
  if (content.length <= 1) {
    return content;
  }

  return content.sort((packageA, packageB) => {
    const comparison = packageA.latest_package.localeCompare(
      packageB.latest_package
    );
    return sortingDirection === 'asc' ? comparison : -comparison;
  });
};

export default function UpgradablePackages({
  hostName,
  upgradablePackages,
  patchesLoading,
  onPatchClick = noop,
  onLoad = noop,
}) {
  const [search, setSearch] = useState('');
  const [csvURL, setCsvURL] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const toggleSortDirection = () => {
    setSortDirection((prevDirection) =>
      prevDirection === 'asc' ? 'desc' : 'asc'
    );
  };

  const enrichedPackages = upgradablePackages.map((packageDetails) => {
    const {
      name,
      from_version,
      from_release,
      to_version,
      to_release,
      arch,
      patches = [],
    } = packageDetails;

    return {
      ...packageDetails,
      installedPackage: `${name}-${from_version}-${from_release}.${arch}`,
      latestPackage: `${name}-${to_version}-${to_release}.${arch}`,
      patches,
    };
  });

  const filteredPackages = enrichedPackages.filter(
    ({ name, patches }) =>
      containsSubstring(name, search) ||
      patches
        .map(({ advisory }) => containsSubstring(advisory, search))
        .includes(true)
  );

  const csvContent = enrichedPackages.map(
    ({ installedPackage, latestPackage, patches }) => {
      const advisories = patches.map(({ advisory }) => advisory).join(',');

      return {
        installed_package: installedPackage,
        latest_package: latestPackage,
        patches: advisories,
      };
    }
  );

  useEffect(() => {
    // Ensure to revoke previous csvUrls
    if (csvURL) {
      URL.revokeObjectURL(csvURL);
    }
    setCsvURL(
      enrichedPackages.length > 0
        ? URL.createObjectURL?.(
            new File(
              [
                Papa.unparse(
                  {
                    fields: ['installed_package', 'latest_package', 'patches'],
                    data: sortCsvContent(csvContent, sortDirection),
                  },
                  { header: true }
                ),
              ],
              `${hostName}-upgradable-packages.csv`,
              { type: 'text/csv' }
            )
          )
        : null
    );

    return () => {
      if (csvURL) {
        URL.revokeObjectURL(csvURL);
      }
    };
  }, [enrichedPackages.length, patchesLoading, sortDirection]);

  return (
    <>
      <div className="flex flex-wrap space-x-4">
        <div className="flex h-auto overflow-ellipsis break-words">
          <PageHeader>
            Upgradable packages: <span className="font-bold">{hostName}</span>
          </PageHeader>
        </div>
        <div className="flex flex-1 items-center space-x-2 lg:justify-end">
          <Input
            className="flex flex-1 min-w-36 lg:max-w-96"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name or Patch"
            prefix={<EOS_SEARCH size="l" />}
          />
          <a href={csvURL} download={`${hostName}-upgradable-packages.csv`}>
            <Button className="w-max" type="primary-white" disabled={!csvURL}>
              Download CSV
            </Button>
          </a>
        </div>
      </div>
      <UpgradablePackagesList
        patchesLoading={patchesLoading}
        upgradablePackages={filteredPackages}
        onPatchClick={onPatchClick}
        onLoad={onLoad}
        toggleSortDirection={toggleSortDirection}
        sortDirection={sortDirection}
      />
    </>
  );
}
