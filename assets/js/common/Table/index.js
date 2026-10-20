// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import Table from './Table';

export { ITEMS_PER_PAGE_PARAM } from './Table';

export {
  createStringSortingPredicate,
  createNumberSortingPredicate,
  createDateSortingPredicate,
} from './sorting';

export default Table;
