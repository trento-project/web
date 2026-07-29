// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';

import { valuesMap } from 'eos-icons-react/lib/helper';

export const computedIconCssClass = (fillColor, centered) =>
  classNames(fillColor, { 'mx-auto': centered });

export const getIconSize = (size) =>
  typeof size === 'string' ? valuesMap[size] : size;
