import ChecksSelection from './ChecksSelection';

export const canStartExecution = (selectedChecks, savingSuccessful) =>
  savingSuccessful && selectedChecks.length > 0;

export default ChecksSelection;
