import React, { useState, useEffect } from 'react';
import { EOS_SEARCH } from 'eos-icons-react';

import PageHeader from '@common/PageHeader';
import PatchList from '@common/PatchList';
import Input from '@common/Input';
import Select from '@common/Select';
import Button from '@common/Button';

const advisoryTypesFromPatches = (patches) =>
  Array.from(new Set(patches.map(({ advisory_type }) => advisory_type))).sort();

const filterPatchesByAdvisoryType = (patches, advisoryType) =>
  patches.filter(({ advisory_type }) =>
    advisoryType === 'all' ? true : advisory_type === advisoryType
  );

function HostRelevanPatches({ hostName, onNavigate, patches }) {
  const advisoryTypes = ['all'].concat(advisoryTypesFromPatches(patches));

  const [displayedAdvisories, setDisplayedAdvisories] = useState('all');
  const [search, setSearch] = useState('');

  const [displayedPatches, setDisplayedPatches] = useState(patches);

  useEffect(() => {
    setDisplayedPatches(
      filterPatchesByAdvisoryType(patches, displayedAdvisories)
    );
  }, [patches, displayedAdvisories]);

  return (
    <>
      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-ellipsis break-words">
          <PageHeader>
            Relevant Patches: <span className="font-bold">{hostName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/2 justify-end">
          <div className="flex gap-2 w-fit">
            <Select
              onChange={setDisplayedAdvisories}
              options={advisoryTypes}
              optionsName="optionz"
              value={displayedAdvisories}
            />
            <Input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Synopsis"
              prefix={<EOS_SEARCH size="l" />}
            />
            <Button size="small" className="inline-block" type="primary-white">
              Download CSV
            </Button>
          </div>
        </div>
      </div>
      <PatchList
        searchBy={search}
        onNavigate={onNavigate}
        patches={displayedPatches}
      />
    </>
  );
}

export default HostRelevanPatches;
