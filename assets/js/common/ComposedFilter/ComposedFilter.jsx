import React, { useEffect, useState } from 'react';
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
 * @param {ReactNode} props.children - Additional elements to display after the filters
 */
function ComposedFilter({
  filters = [],
  onChange,
  value: initialValue = {},
  autoApply,
  children,
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

  useEffect(() => {
    setValue(initialValue);
  }, [JSON.stringify(initialValue)]);

  return (
    <div className="grid grid-flow-col gap-4">
      {filters
        .map(({ key, ...rest }) => [key, rest, value[key], onFilterChange(key)])
        .map((args) => renderFilter(...args))}
      {!autoApply && (
        <div className="grid grid-rows-subgrid gap-4 row-span-2">
          <Button
            className="col-span-1"
            disabled={!isChanged}
            onClick={() => {
              setIsChanged(false);
              onChange(value);
            }}
          >
            Apply
          </Button>
          <Button
            className="col-span-1"
            type="primary-white"
            onClick={() => {
              setValue({});
              setIsChanged(false);
              onChange({});
            }}
          >
            Reset
          </Button>
          {children}
        </div>
      )}
    </div>
  );
}

export default ComposedFilter;
