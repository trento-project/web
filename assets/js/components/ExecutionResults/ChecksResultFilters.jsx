import React, { useState, useEffect } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import Filter from '@components/Table/Filter';

export const RESULT_FILTER_FIELD = 'result';

const defaultSavedFilters = [];

const getFilters = (savedFilters, searchParams) =>
  savedFilters.length >= 0 && searchParams.getAll('health').length === 0
    ? savedFilters
    : searchParams.getAll('health');

function ChecksResultFilters({
  savedFilters = defaultSavedFilters,
  onChange = () => {},
  onSave = () => {},
}) {
  const [filtersForField, setFiltersForField] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  // This structure is the foundation for a multi field filters
  // we can reuse later this structure in other parts of the application

  useEffect(() => {
    const selectedFilters = getFilters(savedFilters, searchParams);

    setFiltersForField({
      RESULT_FILTER_FIELD: {
        predicates: selectedFilters.map(
          (value) => (checks) => checks[RESULT_FILTER_FIELD] === value
        ),
        values: selectedFilters,
      },
    });
  }, [searchParams, savedFilters]);

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
        value={getFilters(savedFilters, searchParams)}
        onChange={(list) => {
          onSave(list);
          setSearchParams(createSearchParams({ health: list }));
        }}
      />
    </div>
  );
}

export default ChecksResultFilters;
