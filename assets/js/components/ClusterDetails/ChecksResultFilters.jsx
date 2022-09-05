import React, { useState } from 'react';
import Filter from '@components/Table/Filter';
import { useEffect } from 'react';

export const RESULT_FILTER_FIELD = 'result';

const ChecksResultFilters = ({ onChange }) => {
  const [filtersForField, setFiltersForField] = useState({});

  // This structure is the foundation for a multi field filters
  // we can reuse later this structure in other parts of the application

  useEffect(() => {
    if (Object.keys(filtersForField).length >= 0) {
      const filtersToApply = Object.keys(filtersForField).reduce(
        (acc, curr) => {
          return [
            ...acc,
            ...filtersForField[curr],
          ];
        },
        []
      );

      onChange(filtersToApply);
    }
  }, [filtersForField]);

  return (
    <div className="flex">
      <Filter
        key={RESULT_FILTER_FIELD}
        title={'checks result'}
        options={['passing', 'warning']}
        value={['passing', 'warning']}
        onChange={(list) => {
          setFiltersForField((existingFilters) => ({
            ...existingFilters,
            [RESULT_FILTER_FIELD]: list.map(
              (value) => (checks) => checks[RESULT_FILTER_FIELD] === value
            ),
          }));
        }}
      />
    </div>
  );
};

export default ChecksResultFilters;
