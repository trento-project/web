// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import Select, { OPTION_ALL } from './Select';

export const createOptionRenderer =
  (optionAllLabel, renderer) => (option, disabled) => {
    if (option === OPTION_ALL) {
      return optionAllLabel;
    }
    return renderer(option, disabled);
  };

export { OPTION_ALL };

export default Select;
