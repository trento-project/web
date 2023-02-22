import React from 'react';
import { format } from 'date-fns';

import Spinner from '@components/Spinner';
import {
  REQUESTED_EXECUTION_STATE,
  RUNNING_EXECUTION_STATE,
} from '@state/lastExecutions';
import CheckResultCount from './CheckResultCount';

const pendingStates = [RUNNING_EXECUTION_STATE, REQUESTED_EXECUTION_STATE];

function ChecksResultOverview({
  data,
  error = null,
  loading = false,
  onCheckClick,
}) {
  if (loading || pendingStates.includes(data?.status)) {
    return (
      <div className="flex flex-col items-center mt-2 px-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center mt-2 px-4">
        <div className="text-center text-xs">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center mt-2 px-4">
        <div className="text-center text-xs">No check results available.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-2xl font-bold">Check Results</h1>
      <h6 className="opacity-60 text-xs">
        {format(new Date(data.completed_at), 'iii MMM dd, HH:mm:ss y')}
      </h6>

      <div className="flex flex-col self-start w-full px-4 mt-2">
        <CheckResultCount
          onClick={() => onCheckClick('passing')}
          value={data.passing_count}
          result="passing"
        />
        <CheckResultCount
          onClick={() => onCheckClick('warning')}
          value={data.warning_count}
          result="warning"
        />
        <CheckResultCount
          onClick={() => onCheckClick('critical')}
          value={data.critical_count}
          result="critical"
        />
      </div>
    </div>
  );
}

export default ChecksResultOverview;
