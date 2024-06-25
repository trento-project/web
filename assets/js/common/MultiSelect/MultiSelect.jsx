import React from 'react';

import Select, { components as selectComponents } from 'react-select';
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

import { noop } from 'lodash';
import classNames from 'classnames';

import Tooltip from '@common/Tooltip';

const option = (props) => (
  <Tooltip content={props.data.tooltip} isEnabled={!!props.data.tooltip}>
    <selectComponents.Option {...props} />
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

const defaultComponents = {
  Option: option,
  MultiValueContainer: multiValueContainer,
  DropdownIndicator: dropdownIndicator,
  ClearIndicator: clearIndicator,
  MultiValueRemove: multiValueRemove,
};

const defaultClassNames = {
  multiValue: () =>
    'rounded-md bg-green-100 text-green-800 px-1 py-2px space-x-1 mr-1',
  multiValueLabel: () => 'ml-1',
  control: ({ isDisabled }) =>
    classNames(
      {
        'bg-gray-50': isDisabled,
        'bg-white': !isDisabled,
      },
      'relative w-full py-2 px-3 text-left rounded-lg cursor-default border border-gray-300 sm:text-sm'
    ),
  menu: () =>
    'absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-[1]',
  option: ({ isFocused }) =>
    classNames(
      {
        'text-green-900 bg-green-100': isFocused,
      },
      'cursor-default select-none relative py-2 px-3'
    ),
};

function MultiSelect({
  options,
  values,
  disabled = false,
  components = defaultComponents,
  selectClassNames = defaultClassNames,
  unstyled = true,
  onChange = noop,
  className,
  ...props
}) {
  return (
    <Select
      isMulti
      defaultValue={values}
      options={options}
      classNames={selectClassNames}
      components={components}
      onChange={onChange}
      unstyled={unstyled}
      className={className}
      isDisabled={disabled}
      {...props}
    />
  );
}

export default MultiSelect;
