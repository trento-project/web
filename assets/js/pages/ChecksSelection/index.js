// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ChecksSelection from './ChecksSelection';

export const canStartExecution = (selectedChecks, isSaving) =>
  !isSaving && selectedChecks.length > 0;

export { useChecksSelection } from './hooks';

export default ChecksSelection;
