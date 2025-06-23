import React, { useState } from 'react';
import { get, noop } from 'lodash';
import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  PACEMAKER_DISABLE,
  PACEMAKER_ENABLE,
} from '@lib/operations';

import OperationModal from './OperationModal';

const TITLES = {
  [SAP_INSTANCE_START]: 'Start SAP instance',
  [SAP_INSTANCE_STOP]: 'Stop SAP instance',
  [PACEMAKER_ENABLE]: 'Enable Pacemaker',
  [PACEMAKER_DISABLE]: 'Disable Pacemaker',
};

const getOperationTitle = (operation) =>
  get(TITLES, operation, 'unknown operation');

const getSapInstanceStartStopDescription = (
  operation,
  { instanceNumber, sid }
) =>
  `${getOperationTitle(operation)} with instance number ${instanceNumber} in ${sid}`;

const getPacemakerEnableDisableDescription = (operation, { hostName }) =>
  `${getOperationTitle(operation)} systemd unit on host ${hostName}`;

const DESCRIPTION_RESOLVERS = {
  [SAP_INSTANCE_START]: getSapInstanceStartStopDescription,
  [SAP_INSTANCE_STOP]: getSapInstanceStartStopDescription,
  [PACEMAKER_ENABLE]: getPacemakerEnableDisableDescription,
  [PACEMAKER_DISABLE]: getPacemakerEnableDisableDescription,
};

function SimpleAcceptanceOperationModal({
  operation,
  descriptionResolverArgs = {},
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [checked, setChecked] = useState(false);
  const operationTitle = getOperationTitle(operation);

  const descriptionResolver = get(
    DESCRIPTION_RESOLVERS,
    operation,
    () => 'No description available'
  );

  return (
    <OperationModal
      title={operationTitle}
      description={descriptionResolver(operation, descriptionResolverArgs)}
      operationText={operationTitle}
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

export default SimpleAcceptanceOperationModal;
