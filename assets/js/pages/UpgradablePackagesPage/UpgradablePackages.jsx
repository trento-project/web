import React, { useState, useEffect } from 'react';
import { EOS_SEARCH } from 'eos-icons-react';
import { noop } from 'lodash';
import Papa from 'papaparse';

import UpgradablePackagesList from '@common/UpgradablePackagesList';
import PageHeader from '@common/PageHeader';
import Input from '@common/Input';
import Button from '@common/Button';
import { containsSubstring } from '@lib/filter';

export default function UpgradablePackages({
  hostName,
  upgradablePackages,
  patchesLoading,
  onPatchClick = noop,
  onLoad = noop,
}) {
  const [search, setSearch] = useState('');

  const enrichedPackages = upgradablePackages.map((packageDetails) => {
      const { name, from_version, from_release, to_version, to_release, arch } =
        packageDetails;

      console.log(packageDetails)

      return {
        ...packageDetails,
        installed_package: `${name}-${from_version}-${from_release}.${arch}`,
        latest_package: `${name}-${to_version}-${to_release}.${arch}`,
      };
    });

  const displayedPackages = enrichedPackages
    .filter(
      ({ name, patches }) =>
        containsSubstring(name, search) ||
        patches
          .map(({ advisory }) => containsSubstring(advisory, search))
          .includes(true)
    );

  const [csvURL, setCsvURL] = useState(null);

  useEffect(() => {
    setCsvURL(
      enrichedPackages.length > 0
        ? URL.createObjectURL?.(
            new File(
              [
                Papa.unparse(
                  {
                    fields: ['installed_package', 'latest_package', 'patches'],
                    data: enrichedPackages,
                    // TODO: Papa can not parse lists. Make a helper which JSON encodes the array beforehand (Python Pandas does it this way)
                  },
                  { header: true }
                ),
              ],
              `${hostName}-patches.csv`,
              { type: 'text/csv' }
            )
          )
        : null
    );

    return () => {
      if (csvURL) {
        URL.revokeObjectURL?.(csvURL);
      }
    };
  }, [enrichedPackages]);

  return (
    <>
      <div className="flex flex-wrap">
        <div className="flex w-2/3 h-auto overflow-ellipsis break-words">
          <PageHeader>
            Upgradable packages: <span className="font-bold">{hostName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/3 justify-end">
          <Input
            className="flex"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name or Patch"
            prefix={<EOS_SEARCH size="l" />}
          />
          <a href={csvURL} download={`${hostName}-upgradable-packages.csv`}>
            <Button
              className="w-max"
              type="primary-white"
              disabled={enrichedPackages.length <= 0 || !csvURL}
            >
              download csv
            </Button>
          </a>
        </div>
      </div>
      <UpgradablePackagesList
        patchesLoading={patchesLoading}
        upgradablePackages={displayedPackages}
        onPatchClick={onPatchClick}
        onLoad={onLoad}
      />
    </>
  );
}
