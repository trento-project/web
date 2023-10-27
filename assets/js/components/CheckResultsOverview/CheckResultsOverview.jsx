import React from 'react';
import { format } from 'date-fns';

import Spinner from '@components/Spinner';
import {
  REQUESTED_EXECUTION_STATE,
  RUNNING_EXECUTION_STATE,
} from '@state/lastExecutions';

import ChecksComingSoon from '@static/checks-coming-soon.svg';
import CheckResultCount from './CheckResultCount';

const pendingStates = [RUNNING_EXECUTION_STATE, REQUESTED_EXECUTION_STATE];

function CheckResultsOverview({
  data,
  catalogDataEmpty = false,
  error = null,
  loading = false,
  onCheckClick,
}) {
  if (loading || pendingStates.includes(data?.status)) {
    return (
      <div className="flex flex-col items-center px-4">
        <h1 className="text-center text-2xl font-bold">Check Summary</h1>
        <span className="text-sm text-gray-600">
          Checks execution running...
        </span>
        <Spinner size="xl" className="pt-12" />
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

  if (catalogDataEmpty) {
    return (
      <div className="flex flex-col items-center h-full">
        <h1 className="text-center text-2xl font-bold">Check Results</h1>
        <h6 className="opacity-60 text-xs">Checks coming soon</h6>
        <img
          className="h-full inline-block align-middle"
          alt="checks coming soon"
          src={ChecksComingSoon}
        />
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

export default CheckResultsOverview;
