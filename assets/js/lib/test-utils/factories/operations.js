// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { faker } from '@faker-js/faker';
import {
  SAPTUNE_SOLUTION_APPLY,
  SAPTUNE_SOLUTION_CHANGE,
} from '@lib/operations';

export const saptuneOperation = () =>
  faker.helpers.arrayElement([SAPTUNE_SOLUTION_APPLY, SAPTUNE_SOLUTION_CHANGE]);
