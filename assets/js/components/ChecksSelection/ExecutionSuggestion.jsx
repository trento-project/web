import React from 'react';
import { EOS_CANCEL, EOS_PLAY_CIRCLE } from 'eos-icons-react';

import TriggerChecksExecutionRequest from '@components/TriggerChecksExecutionRequest';

function ExecutionSuggestion({
  resourceID,
  selectedChecks,
  hosts,
  onClose = () => {},
  onStartExecution = () => {},
}) {
  return (
    <div>
      <div
        className="flex first-letter:rounded relative bg-green-200 border-green-600 text-green-600 border-l-4 p-2 ml-2"
        role="alert"
      >
        <p className="mr-1">
          Well done! To start execution now, click here 👉{' '}
        </p>
        <TriggerChecksExecutionRequest
          cssClasses="tn-checks-start-execute rounded-full group flex rounded-full items-center text-sm px-2 bg-jungle-green-500 text-white"
          clusterId={resourceID}
          hosts={hosts}
          checks={selectedChecks}
          onStartExecution={onStartExecution}
        >
          <EOS_PLAY_CIRCLE color="green" />
        </TriggerChecksExecutionRequest>
        <button className="ml-1" onClick={() => onClose()} type="button">
          <EOS_CANCEL size={14} className="fill-green-600" />
        </button>
      </div>
    </div>
  );
}

export default ExecutionSuggestion;
