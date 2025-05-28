import React, { useState } from 'react';
import { pipe, filter, map } from 'lodash/fp';
import { noop } from 'lodash';
import Select from '@common/Select';
import OperationModal from './OperationModal';

const NOT_SELECTED = 'Select a saptune solution';

const solutions = [
  {
    value: NOT_SELECTED,
    key: 'not_selected',
    available: (_hana, _app, currentlyApplied) => !currentlyApplied,
  },
  {
    value: 'HANA',
    key: 'hana',
    available: (isHanaRunning, isAppRunning) => isHanaRunning && !isAppRunning,
  },
  {
    value: 'NETWEAVER',
    key: 'netweaver',
    available: (isHanaRunning, isAppRunning) => !isHanaRunning && isAppRunning,
  },
  {
    value: 'S4HANA-APPSERVER',
    key: 's4hana-appserver',
    available: (isHanaRunning, isAppRunning) => !isHanaRunning && isAppRunning,
  },
  {
    value: 'S4HANA-APP+DB',
    key: 's4hana-app-db',
    available: (isHanaRunning, isAppRunning) => isHanaRunning && isAppRunning,
  },
  {
    value: 'S4HANA-DBSERVER',
    key: 's4hana-dbserver',
    available: (isHanaRunning, isAppRunning) => isHanaRunning && !isAppRunning,
  },
  {
    value: 'NETWEAVER+HANA',
    key: 'netweaver-hana',
    available: (isHanaRunning, isAppRunning) => isHanaRunning && isAppRunning,
  },
];

const availableOptions =
  (isHanaRunning, isAppRunning, currentlyApplied) =>
  ({ available }) =>
    available(isHanaRunning, isAppRunning, currentlyApplied);

const markOptionDisabled = (currentlyApplied) => (option) => ({
  ...option,
  disabled: option.value === currentlyApplied,
});

function SaptuneSolutionOperationModal({
  title,
  currentlyApplied,
  isHanaRunning,
  isAppRunning,
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [checked, setChecked] = useState(false);
  const [solution, setSolution] = useState(currentlyApplied || NOT_SELECTED);

  const availableSolutions = pipe(
    filter(availableOptions(isHanaRunning, isAppRunning, currentlyApplied)),
    map(markOptionDisabled(currentlyApplied))
  )(solutions);

  return (
    <OperationModal
      title={title}
      description="Select Saptune tuning solution"
      operationText="Saptune solution"
      applyDisabled={
        !checked || solution === NOT_SELECTED || solution === currentlyApplied
      }
      checked={checked}
      isOpen={isOpen}
      onChecked={() => setChecked((prev) => !prev)}
      onRequest={() => {
        onRequest(solution);
        setChecked(false);
      }}
      onCancel={() => {
        onCancel();
        setSolution(currentlyApplied || NOT_SELECTED);
        setChecked(false);
      }}
    >
      <div className="flex items-center justify-start gap-2 mt-4">
        <p className="font-semibold text-gray-900 tracking-wide">
          Saptune Solution
        </p>
        <Select
          className="ml-auto !w-2/3"
          optionsName="solutions"
          options={availableSolutions}
          value={solution}
          onChange={(value) => setSolution(value)}
          disabled={!checked}
        />
      </div>
    </OperationModal>
  );
}

export default SaptuneSolutionOperationModal;
