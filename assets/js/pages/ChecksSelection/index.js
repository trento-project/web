// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import ChecksSelection from './ChecksSelection';

export const canStartExecution = (selectedChecks, isSaving) =>
  !isSaving && selectedChecks.length > 0;

export { useChecksSelection } from './hooks';

export default ChecksSelection;
