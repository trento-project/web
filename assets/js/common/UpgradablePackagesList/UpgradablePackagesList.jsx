import React, { useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import Table, { createStringSortingPredicate } from '@common/Table';

const upgradablePackagesDefault = [];

function UpgradablePackagesList({
  upgradablePackages = upgradablePackagesDefault,
  onPatchClick = noop,
  onLoad = noop,
}) {
  const [sortDirection, setSortDirection] = useState('asc');

  const toggleSortDirection = () => {
    if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection('asc');
    }
  };

  const sortByLatestPackage = createStringSortingPredicate(
    'latestPackage',
    sortDirection
  );

  const config = {
    pagination: true,
    usePadding: false,
    onPageChange: onLoad,
    columns: [
      {
        title: 'Installed Packages',
        key: 'installedPackage',
        render: (content, _) => <div className="font-bold">{content}</div>,
      },
      {
        title: 'Latest Package',
        key: 'latestPackage',
        sortable: true,
        sortDirection,
        handleClick: () => toggleSortDirection(),
        render: (content, _) => <div>{content}</div>,
      },
      {
        title: 'Related Patches',
        key: 'patches',
        render: (content, { to_package_id }) => (
          <div>
            {content &&
              content.map(({ advisory }) => (
                <div key={`${to_package_id}-${advisory}`}>
                  <Button
                    type="link"
                    size="fit"
                    onClick={() => onPatchClick(advisory)}
                  >
                    {advisory}
                  </Button>
                </div>
              ))}
          </div>
        ),
      },
    ],
  };

  const data = upgradablePackages.map((packageDetails) => {
    const { name, from_version, from_release, to_version, to_release, arch } =
      packageDetails;

    return {
      ...packageDetails,
      installedPackage: `${name}-${from_version}-${from_release}.${arch}`,
      latestPackage: `${name}-${to_version}-${to_release}.${arch}`,
    };
  });

  return <Table config={config} data={data} sortBy={sortByLatestPackage} />;
}

export default UpgradablePackagesList;
