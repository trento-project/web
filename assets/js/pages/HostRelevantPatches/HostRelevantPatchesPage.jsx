import React, { useState, useEffect } from 'react';
import { EOS_SEARCH } from 'eos-icons-react';
import Papa from 'papaparse';

import PageHeader from '@common/PageHeader';
import PatchList from '@common/PatchList';
import Input from '@common/Input';
import Select from '@common/Select';
import Button from '@common/Button';

import { containsSubstring } from '@lib/filter';

const advisoryTypesFromPatches = (patches) =>
  Array.from(new Set(patches.map(({ advisory_type }) => advisory_type))).sort();

const filterPatchesByAdvisoryType = (patches, advisoryType) =>
  patches.filter(({ advisory_type }) =>
    advisoryType === 'all' ? true : advisory_type === advisoryType
  );

function HostRelevantPatches({ hostName, onNavigate, patches }) {
  const advisoryTypes = ['all'].concat(advisoryTypesFromPatches(patches));

  const [displayedAdvisories, setDisplayedAdvisories] = useState('all');
  const [search, setSearch] = useState('');

  const [displayedPatches, setDisplayedPatches] = useState(patches);

  const [csvURL, setCsvURL] = useState(null);

  useEffect(() => {
    setCsvURL(
      patches.length > 0
        ? URL.createObjectURL?.(
            new File(
              [
                Papa.unparse(
                  {
                    fields: [
                      'advisory_type',
                      'advisory_name',
                      'advisory_synopsis',
                      'update_date',
                    ],
                    data: patches,
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
  }, [patches.length]);

  useEffect(() => {
    const filteredByAdvisoryType = filterPatchesByAdvisoryType(
      patches,
      displayedAdvisories
    );
    const searchResult = filteredByAdvisoryType.filter(
      ({ advisory_synopsis }) =>
        advisory_synopsis ? containsSubstring(advisory_synopsis, search) : false
    );
    setDisplayedPatches(searchResult);
  }, [patches, displayedAdvisories, search]);

  return (
    <>
      <div className="flex flex-wrap">
        <div className="flex w-1/2 overflow-ellipsis break-words">
          <PageHeader>
            Relevant Patches: <span className="font-bold">{hostName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/2 gap-2 justify-end">
          <Select
            onChange={setDisplayedAdvisories}
            options={advisoryTypes}
            optionsName="options"
            className="w-64"
            value={displayedAdvisories}
          />
          <Input
            className="w-1/4"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Synopsis"
            prefix={<EOS_SEARCH size="l" />}
          />
          <a href={csvURL} download={`${hostName}-patches.csv`}>
            <Button
              className="w-max"
              type="primary-white"
              disabled={patches.length <= 0 || !csvURL}
            >
              Download CSV
            </Button>
          </a>
        </div>
      </div>
      <PatchList onNavigate={onNavigate} patches={displayedPatches} />
    </>
  );
}

export default HostRelevantPatches;
