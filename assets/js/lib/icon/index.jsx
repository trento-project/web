// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import classNames from 'classnames';

import { valuesMap } from 'eos-icons-react/lib/helper';

export const computedIconCssClass = (fillColor, centered) =>
  classNames(fillColor, { 'mx-auto': centered });

export const getIconSize = (size) =>
  typeof size === 'string' ? valuesMap[size] : size;
