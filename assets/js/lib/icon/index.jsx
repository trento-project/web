// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';

export const computedIconCssClass = (fillColor, centered) =>
  classNames(fillColor, { 'mx-auto': centered });
