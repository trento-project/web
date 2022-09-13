import { format } from 'date-fns';
import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';
import React from 'react';

const uiForResult = {
  passing: {
    color: 'green',
    component: EOS_CHECK_CIRCLE_OUTLINED,
    copy: 'Passed',
  },
  warning: {
    color: 'yellow',
    component: EOS_WARNING_OUTLINED,
    copy: 'Warning',
  },
  critical: { color: 'red', component: EOS_ERROR_OUTLINED, copy: 'Critical' },
};

const CheckResult = ({ value, result, onClick }) => {
  const color = uiForResult[result].color;
  const Component = uiForResult[result].component;
  const copy = uiForResult[result].copy;

  return (
    <div
      role="button"
      onClick={onClick}
      className="hover:text-jungle-green-500 flex items-center rounded p-3 text-lg font-bold"
    >
      <span className={`rounded-lg p-2 bg-${color}-200 mr-2`}>
        <Component size={25} className={`fill-${color}-600`} />
      </span>
      <div className="flex w-full ml-2 items-center w-[65%]">
        <p>{copy}</p>
      </div>
      <div className="flex text-2xl">{value}</div>
    </div>
  );
};

const ChecksResultOverview = ({
  passing = 0,
  warning = 0,
  critical = 0,
  lastCheckExecution = new Date(),
  onCheckClick,
}) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-2xl font-bold">Check Results</h1>
      <h6 className="opacity-60 text-xs">
        {format(lastCheckExecution, 'iii MMM dd, HH:MM:SS y')}
      </h6>

      <div className="flex flex-col self-start w-full px-4 mt-2">
        <CheckResult onClick={onCheckClick} value={passing} result="passing" />
        <CheckResult onClick={onCheckClick} value={warning} result="warning" />
        <CheckResult
          onClick={onCheckClick}
          value={critical}
          result="critical"
        />
      </div>
    </div>
  );
};

export default ChecksResultOverview;
