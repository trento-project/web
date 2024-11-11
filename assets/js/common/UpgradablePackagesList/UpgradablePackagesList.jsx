import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import Table, { createStringSortingPredicate } from '@common/Table';
import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

const upgradablePackagesDefault = [];

function UpgradablePackagesList({
  upgradablePackages = upgradablePackagesDefault,
  patchesLoading,
  onPatchClick = noop,
  sortDirection = 'asc',
  toggleSortDirection = () => {},
}) {
  const [sortBy, setSortBy] = useState(sortDirection);
  const sortByLatestPackage = createStringSortingPredicate(
    'latestPackage',
    sortBy
  );

  useEffect(() => {
    setSortBy(sortDirection);
  }, [sortDirection]);

  const config = {
    pagination: true,
    usePadding: false,
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
        sortBy,
        handleClick: () => toggleSortDirection(),
        render: (content, _) => <div>{content}</div>,
      },
      {
        title: 'Related Patches',
        key: 'patches',
        render: (content, { to_package_id }) => {
          if (patchesLoading) {
            return (
              <div>
                <EOS_LOADING_ANIMATED />
              </div>
            );
          }
          return (
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
          );
        },
      },
    ],
  };

  return (
    <Table
      config={config}
      data={upgradablePackages}
      sortBy={sortByLatestPackage}
    />
  );
}

export default UpgradablePackagesList;
