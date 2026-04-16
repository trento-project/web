import React, { useState } from 'react';
import { pipe, filter, map } from 'lodash/fp';
import { noop } from 'lodash';
import Select from '@common/Select';
import { getOperationTitle } from '@lib/operations';
import OperationModal from './OperationModal';

const NOT_SELECTED = 'Select a saptune solution';

const solutions = [
  {
    value: NOT_SELECTED,
    available: (_hana, _app, currentlyApplied) => !currentlyApplied,
  },
  {
    value: 'HANA',
    available: (isHanaRunning, isAppRunning, _currentlyApplied) =>
      isHanaRunning && !isAppRunning,
  },
  {
    value: 'NETWEAVER',
    available: (isHanaRunning, isAppRunning, _currentlyApplied) =>
      !isHanaRunning && isAppRunning,
  },
  {
    value: 'S4HANA-APPSERVER',
    available: (isHanaRunning, isAppRunning, _currentlyApplied) =>
      !isHanaRunning && isAppRunning,
  },
  {
    value: 'S4HANA-APP+DB',
    available: (isHanaRunning, isAppRunning, _currentlyApplied) =>
      isHanaRunning && isAppRunning,
  },
  {
    value: 'S4HANA-DBSERVER',
    available: (isHanaRunning, isAppRunning, _currentlyApplied) =>
      isHanaRunning && !isAppRunning,
  },
  {
    value: 'NETWEAVER+HANA',
    available: (isHanaRunning, isAppRunning, _currentlyApplied) =>
      isHanaRunning && isAppRunning,
  },
];

const availableOptions =
  (isHanaRunning, isAppRunning, currentlyApplied) =>
  ({ available }) =>
    available(isHanaRunning, isAppRunning, currentlyApplied);

const markOptionDisabled = (currentlyApplied) => (option) => ({
  ...option,
  label: option.value,
  isDisabled: option.value === currentlyApplied,
});

function SaptuneSolutionOperationModal({
  operation,
  currentlyApplied,
  isHanaRunning,
  isAppRunning,
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [solution, setSolution] = useState(currentlyApplied || NOT_SELECTED);

  const title = getOperationTitle(operation);

  const availableSolutions = pipe(
    filter(availableOptions(isHanaRunning, isAppRunning, currentlyApplied)),
    map(markOptionDisabled(currentlyApplied))
  )(solutions);

  return (
    <OperationModal
      title={title}
      description="Select Saptune tuning solution"
      operationText={title}
      requestDisabled={
        solution === NOT_SELECTED || solution === currentlyApplied
      }
      isOpen={isOpen}
      onRequest={() => onRequest(solution)}
      onCancel={() => {
        onCancel();
        setSolution(currentlyApplied || NOT_SELECTED);
      }}
    >
      <div className="flex items-center justify-start gap-2 mt-4">
        <p className="font-semibold text-gray-900 tracking-wide">
          Saptune Solution
        </p>
        <Select
          className="ml-auto !w-2/3"
          aria-label="solutions"
          options={availableSolutions}
          value={{value: solution, label: solution}}
          values={[solution]}
          onChange={setSolution}
        />
      </div>
    </OperationModal>
  );
}

export default SaptuneSolutionOperationModal;
