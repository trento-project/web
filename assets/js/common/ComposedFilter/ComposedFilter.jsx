import React, { useState } from 'react';
import Button from '@common/Button';
import Filter from '@common/Filter';
import DateFilter from '@common/DateFilter';

const renderFilter = (key, { type, ...filterProps }, value, onChange) => {
  switch (type) {
    case 'select':
      return (
        <Filter key={key} {...filterProps} value={value} onChange={onChange} />
      );
    case 'date':
      return (
        <DateFilter
          key={key}
          {...filterProps}
          value={value}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
};

/**
 * Define a filter which is the composition of several filters.
 * Filters are specified through a list of objects, each containing the filter properties.
 * The value of the composed filter is an object with the filter key as key and the selected value as value.
 *
 * @param {Array} props.filters - List of filters to be composed. Filters are displayed in order.
 * @param {Object} props.value - Key/value pairs of selected filters, where key is the filter key
 * @param {Function} props.onChange - Function to call when the composed value changes. If autoApply is true, this function is called on every filter change
 * @param {Boolean} props.autoApply - If true, onChange is called on every filter change; otherwise, an apply button is shown
 */
function ComposedFilter({
  filters = [],
  onChange,
  value: initialValue = {},
  autoApply,
}) {
  const [value, setValue] = useState(initialValue);
  const [isChanged, setIsChanged] = useState(false);
  const onFilterChange = (key) => (filterValue) => {
    const newValue = { ...value, [key]: filterValue };
    setValue(newValue);
    if (autoApply) {
      onChange(newValue);
    } else {
      setIsChanged(true);
    }
  };

  return (
    <>
      {filters
        .map(({ key, ...rest }) => [key, rest, value[key], onFilterChange(key)])
        .map((args) => renderFilter(...args))}
      {!autoApply && (
        <div className="flex flex-row w-64 space-x-2">
          <Button
            disabled={!isChanged}
            onClick={() => {
              setIsChanged(false);
              onChange(value);
            }}
          >
            Apply
          </Button>
          <Button
            type="primary-white"
            onClick={() => {
              setValue({});
              setIsChanged(false);
              onChange({});
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </>
  );
}

export default ComposedFilter;
