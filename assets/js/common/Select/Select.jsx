import React from 'react';

import {
  default as ReactSelect,
  components as selectComponents,
} from 'react-select';
import {
  ChevronUpDownIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/20/solid';

import { has, map, noop } from 'lodash';
import classNames from 'classnames';

import Tooltip from '@common/Tooltip';

export const OPTION_ALL = 'all';

const option = (props) => (
  <Tooltip content={props.data.tooltip} isEnabled={!!props.data.tooltip}>
    <selectComponents.Option {...props}>
      {props.selectProps.renderOption(props.children, props.isDisabled)}
      {props.isSelected && (
        <span className="absolute inset-y-0 right-2 end-1 flex items-center pl-3 text-green-600">
          <CheckIcon className="w-5 h-5" aria-hidden="true" />
        </span>
      )}
    </selectComponents.Option>
  </Tooltip>
);

const multiValueContainer = (props) => (
  <Tooltip content={props.data.tooltip} isEnabled={!!props.data.tooltip}>
    <selectComponents.MultiValueContainer {...props} />
  </Tooltip>
);

const dropdownIndicator = (props) => (
  <selectComponents.DropdownIndicator {...props}>
    <ChevronUpDownIcon
      className="w-5 h-5 text-gray-400 cursor-pointer"
      aria-hidden="true"
    />
  </selectComponents.DropdownIndicator>
);

const clearIndicator = (props) => (
  <selectComponents.ClearIndicator {...props}>
    <XMarkIcon
      className="w-5 h-5 text-gray-400 cursor-pointer"
      aria-hidden="true"
    />
  </selectComponents.ClearIndicator>
);

const multiValueRemove = (props) => (
  <selectComponents.MultiValueRemove {...props}>
    <XMarkIcon className="w-4 h-4 text-green-800" aria-hidden="true" />
  </selectComponents.MultiValueRemove>
);

export const defaultComponents = {
  Option: option,
  MultiValueContainer: multiValueContainer,
  DropdownIndicator: dropdownIndicator,
  ClearIndicator: clearIndicator,
  MultiValueRemove: multiValueRemove,
};

export const defaultClassNames = {
  multiValue: () =>
    'rounded-md bg-green-100 text-green-800 px-1 py-2px space-x-1 mr-1',
  multiValueLabel: () => 'ml-1',
  control: ({ isDisabled }) =>
    classNames(
      {
        'text-gray-400 bg-gray-50': isDisabled,
        'bg-white': !isDisabled,
      },
      'relative w-full h-full py-2 pl-3 pr-2 text-left rounded cursor-default border border-gray-300 sm:text-sm'
    ),
  menu: () =>
    'absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-[1]',
  option: ({ isFocused, isDisabled }) =>
    classNames(
      {
        'text-gray-400': isDisabled,
        'text-green-900 bg-green-100': !isDisabled && isFocused,
      },
      'cursor-default select-none relative py-2 px-3'
    ),
};

// composeOpts compose old style options and default values
// examples:
// ['Enabled', 'Disabled'] => [
// {value: 'Enabled', label: 'Enabled'},
// {value: 'Disabled', label: 'Disabled'}
// ]
const composeOpts = (opts) =>
  map(opts, (opt) => (has(opt, 'value') ? opt : { value: opt, label: opt }));

const defaultRenderOption = (value) => value;

const defaultFilterOption = (opt, rawInput) => {
  if (!rawInput) return true;
  const input = rawInput.toLowerCase();
  return (
    opt.data.searchLabel?.toLowerCase().includes(input) ||
    opt.data.label.toLowerCase().includes(input)
  );
};

const formatOptionLabel =
  (renderControl) =>
  ({ label, _value }, { context }) => {
    if (context === 'value') {
      return renderControl(label, context.isDisabled);
    }
    return label;
  };

function Select({
  options,
  values = [],
  components = defaultComponents,
  selectClassNames = defaultClassNames,
  isMulti = false,
  isClearable = false,
  isSearchable = false,
  unstyled = true,
  onChange = noop,
  renderControlOption,
  renderOption = defaultRenderOption,
  filterOption = defaultFilterOption,
  className,
  ...props
}) {
  const renderControl = renderControlOption || renderOption;

  // isMulti handles multiples values, so we simply map them
  // otherwise return current option value
  const getChangedValues = isMulti
    ? (opts) => opts.map(({ value }) => value).flat()
    : ({ value }) => value;

  return (
    <ReactSelect
      defaultValue={composeOpts(values)}
      options={composeOpts(options)}
      classNames={selectClassNames}
      components={components}
      isMulti={isMulti}
      isClearable={isClearable}
      isSearchable={isSearchable}
      onChange={(opts) => onChange(getChangedValues(opts))}
      unstyled={unstyled}
      className={className}
      filterOption={filterOption}
      renderOption={renderOption}
      formatOptionLabel={formatOptionLabel(renderControl)}
      {...props}
    />
  );
}

export default Select;
