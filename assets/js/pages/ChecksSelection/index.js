import ChecksSelection from './ChecksSelection';

export const canStartExecution = (selectedChecks, isSaving) =>
  !isSaving && selectedChecks.length > 0;

export default ChecksSelection;
