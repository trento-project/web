import React from 'react';
import { format } from 'date-fns';

import CheckResultCount from './CheckResultCount';

function ChecksResultOverview({
  passing = 0,
  warning = 0,
  critical = 0,
  lastCheckExecution = new Date(),
  onCheckClick,
}) {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-2xl font-bold">Check Results</h1>
      <h6 className="opacity-60 text-xs">
        {format(lastCheckExecution, 'iii MMM dd, HH:MM:SS y')}
      </h6>

      <div className="flex flex-col self-start w-full px-4 mt-2">
        <CheckResultCount
          onClick={() => onCheckClick('passing')}
          value={passing}
          result="passing"
        />
        <CheckResultCount
          onClick={() => onCheckClick('warning')}
          value={warning}
          result="warning"
        />
        <CheckResultCount
          onClick={() => onCheckClick('critical')}
          value={critical}
          result="critical"
        />
      </div>
    </div>
  );
}

export default ChecksResultOverview;
