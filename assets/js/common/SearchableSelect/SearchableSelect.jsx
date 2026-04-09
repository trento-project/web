import React from 'react';
import classNames from 'classnames';
import MultiSelect from '@common/MultiSelect';

const defaultFilterOption = (option, rawInput) => {
  if (!rawInput) return true;
  const input = rawInput.toLowerCase();
  return (
    option.data.searchLabel?.toLowerCase().includes(input) ||
    option.data.label.toLowerCase().includes(input)
  );
};

function SearchableSelect({
  value,
  options,
  onChange,
  disabled = false,
  className = '',
  isClearable = false,
  placeholder,
  noOptionsMessage,
  filterOption = defaultFilterOption,
  ...props
}) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <MultiSelect
      options={options}
      value={selectedOption}
      isMulti={false}
      onChange={(option) => onChange(option?.value)}
      disabled={disabled}
      isClearable={isClearable}
      isSearchable
      className={classNames('text-sm', className)}
      placeholder={placeholder}
      noOptionsMessage={noOptionsMessage}
      filterOption={filterOption}
      {...props}
    />
  );
}

export default SearchableSelect;
