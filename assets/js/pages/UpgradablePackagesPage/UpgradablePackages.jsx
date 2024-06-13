import React, { useState } from 'react';
import { EOS_SEARCH } from 'eos-icons-react';

import UpgradablePackagesList from '@common/UpgradablePackagesList';
import PageHeader from '@common/PageHeader';
import Input from '@common/Input';
import { containsSubstring } from '@lib/filter';

export default function UpgradablePackages({ hostName, upgradablePackages }) {
  const [search, setSearch] = useState('');

  const displayedPackages = upgradablePackages.filter(
    ({ name, patches }) =>
      containsSubstring(name, search) ||
      patches
        .map(({ advisory }) => containsSubstring(advisory, search))
        .includes(true)
  );

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
        </div>
      </div>
      <UpgradablePackagesList upgradablePackages={displayedPackages} />
    </>
  );
}
