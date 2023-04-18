import React, { useState, useEffect } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import Filter from '@components/Table/Filter';

export const RESULT_FILTER_FIELD = 'result';

function ChecksResultFilters({ onChange }) {
  const [filtersForField, setFiltersForField] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  // This structure is the foundation for a multi field filters
  // we can reuse later this structure in other parts of the application

  useEffect(() => {
    const selectedFilters = searchParams.getAll('health');

    setFiltersForField({
      RESULT_FILTER_FIELD: {
        predicates: selectedFilters.map(
          (value) => (checks) => checks[RESULT_FILTER_FIELD] === value
        ),
        values: selectedFilters,
      },
    });
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(filtersForField).length >= 0) {
      const filtersToApply = Object.keys(filtersForField).reduce(
        (acc, curr) => [...acc, ...filtersForField[curr].predicates],
        []
      );

      onChange(filtersToApply);
    }
  }, [filtersForField]);

  return (
    <div className="flex">
      <Filter
        key={RESULT_FILTER_FIELD}
        title="checks result"
        options={['passing', 'warning', 'critical', 'unknown']}
        value={searchParams.getAll('health')}
        onChange={(list) => {
          setSearchParams(createSearchParams({ health: list }));
        }}
      />
    </div>
  );
}

export default ChecksResultFilters;
