import React, { useState } from 'react';
import { filter } from 'lodash';
import Select from '@common/Select';
import OperationModal from './OperationModal';

const NOT_SELECTED = 'Select a saptune solution';

const solutions = [
  {
    value: NOT_SELECTED,
    key: 'not_selected',
    available: () => true,
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

function SaptuneSolutionApplyModal({
  isHanaRunning,
  isAppRunning,
  isOpen = false,
  onRequest,
  onCancel,
}) {
  const [checked, setChecked] = useState(false);
  const [solution, setSolution] = useState(NOT_SELECTED);

  const availableSolutions = filter(solutions, ({ available }) =>
    available(isHanaRunning, isAppRunning)
  );

  return (
    <OperationModal
      title="Apply Saptune Solution"
      description="Select Saptune tuning solution"
      operationText="Saptune solution"
      applyDisabled={!checked || solution === NOT_SELECTED}
      checked={checked}
      isOpen={isOpen}
      onChecked={() => setChecked((prev) => !prev)}
      onRequest={() => onRequest(solution)}
      onCancel={onCancel}
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

export default SaptuneSolutionApplyModal;
