import React from 'react';
import { capitalize } from 'lodash';

export const PASSWORD_PLACEHOLDER = '********';
export const PASSWORD_POLICY_TEXT = (
  <div>
    The password must be compliant with:
    <br />
    - at least have 8 characters
    <br />
    - does not have 3 consecutive repeated numbers or letters (example: 111 or
    aaa)
    <br />- does not have 4 consecutive sequential numbers or letters (example:
    1234, abcd or ABCD)
  </div>
);
export const REQUIRED_FIELD_TEXT = 'Required field';
export const errorMessage = (message) => (
  <p className="text-red-500 mt-1">{capitalize(message)}</p>
);

export const mapAbilities = (abilities) =>
  abilities.map(({ id, name, resource, label }) => ({
    value: id,
    label: `${name}:${resource}`,
    tooltip: label,
  }));
