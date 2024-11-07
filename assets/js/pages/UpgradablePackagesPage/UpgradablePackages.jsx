import React, { useState, useEffect } from 'react';
import { EOS_SEARCH } from 'eos-icons-react';
import { noop, isEmpty } from 'lodash';
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
  const [csvURL, setCsvURL] = useState(null);

  const enrichedPackages = upgradablePackages.map((packageDetails) => {
    const { name, from_version, from_release, to_version, to_release, arch } =
      packageDetails;

    return {
      ...packageDetails,
      installed_package: `${name}-${from_version}-${from_release}.${arch}`,
      latest_package: `${name}-${to_version}-${to_release}.${arch}`,
    };
  });
  const displayedPackages = enrichedPackages.filter(
    ({ name, patches }) =>
      containsSubstring(name, search) ||
      patches
        .map(({ advisory }) => containsSubstring(advisory, search))
        .includes(true)
  );

  const hasPatches = (packages) =>
    packages.some((packageDetails) => !isEmpty(packageDetails.patches));

  useEffect(() => {
    const packagesData = hasPatches(enrichedPackages)
      ? enrichedPackages.map((packageDetails) => {
          const advisories = packageDetails.patches.map((it) => it.advisory);
          return {
            ...packageDetails,
            patches: advisories,
          };
        })
      : [];

    setCsvURL(
      hasPatches(enrichedPackages)
        ? URL.createObjectURL?.(
            new File(
              [
                Papa.unparse(
                  {
                    fields: ['installed_package', 'latest_package', 'patches'],
                    data: packagesData,
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
  }, [patchesLoading]);

  return (
    <>
      <div className="flex flex-wrap">
        <div className="flex w-2/3 h-auto overflow-ellipsis break-words">
          <PageHeader>
            Upgradable packages: <span className="font-bold">{hostName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/3 gap-2 justify-end">
          <Input
            className="flex"
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
        upgradablePackages={displayedPackages}
        onPatchClick={onPatchClick}
        onLoad={onLoad}
      />
    </>
  );
}
