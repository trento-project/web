import React, { useState } from 'react';
import { get, noop } from 'lodash';
import { SAP_INSTANCE_START, SAP_INSTANCE_STOP } from '@lib/operations';

import OperationModal from './OperationModal';

const TITLES = {
  [SAP_INSTANCE_START]: 'Start SAP instance',
  [SAP_INSTANCE_STOP]: 'Stop SAP instance',
};

const getDescription = (operation, instanceNumber, sid) =>
  `${get(TITLES, operation, 'unknown')} with instance number ${instanceNumber} in ${sid}`;

function SapInstanceStartStopModal({
  operation,
  instanceNumber,
  sid,
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [checked, setChecked] = useState(false);

  return (
    <OperationModal
      title={get(TITLES, operation, 'unknown')}
      description={getDescription(operation, instanceNumber, sid)}
      operationText={get(TITLES, operation, 'unknown')}
      applyDisabled={!checked}
      checked={checked}
      isOpen={isOpen}
      onChecked={() => setChecked((prev) => !prev)}
      onRequest={() => {
        onRequest({});
        setChecked(false);
      }}
      onCancel={() => {
        onCancel();
        setChecked(false);
      }}
    />
  );
}

export default SapInstanceStartStopModal;
