import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';

import Filter from '.';

export default {
  title: 'Components/Filter',
  component: Filter,
};

// storybook stories for the Filter component
export function Default() {
  const [value, setValue] = useState([]);
  const options = [
    'Tony Kekw',
    'Chad Carbonara',
    'Chuck Amatriciana',
    'K.C.O. Pepe',
    'Virgin Gricia',
  ];

  return (
    <Filter
      title="Title"
      options={options}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        action('onChange')(newValue);
      }}
    />
  );
}

export function WithValue() {
  const [value, setValue] = useState(['Tony Kekw']);
  const options = [
    'Tony Kekw',
    'Chad Carbonara',
    'Chuck Amatriciana',
    'K.C.O. Pepe',
    'Virgin Gricia',
  ];

  return (
    <Filter
      title="Title"
      options={options}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        action('onChange')(newValue);
      }}
    />
  );
}

export function withMultipleValues() {
  const [value, setValue] = useState(['Tony Kekw', 'Chad Carbonara']);
  const options = [
    'Tony Kekw',
    'Chad Carbonara',
    'Chuck Amatriciana',
    'K.C.O. Pepe',
    'Virgin Gricia',
  ];

  return (
    <Filter
      title="Title"
      options={options}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        action('onChange')(newValue);
      }}
    />
  );
}
