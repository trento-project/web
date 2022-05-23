import React from 'react';
import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';

const any = (predicate, label) =>
  Object.keys(predicate).reduce((accumulator, key) => {
    if (accumulator) {
      return true;
    }
    return predicate[key] === label;
  }, false);

const getCounters = (data) => {
  const defaultCounter = { critical: 0, warning: 0, passing: 0, unknown: 0 };

  if (!data || 0 === data.length) {
    return defaultCounter;
  }

  return data.reduce((accumulator, element) => {
    if (any(element, 'critical')) {
      return { ...accumulator, critical: accumulator.critical + 1 };
    }

    if (any(element, 'warning')) {
      return { ...accumulator, warning: accumulator.warning + 1 };
    }

    if (any(element, 'unknown')) {
      return { ...accumulator, unknown: accumulator.unknown + 1 };
    }

    if (any(element, 'passing')) {
      return { ...accumulator, passing: accumulator.passing + 1 };
    }
    return accumulator;
  }, defaultCounter);
};

const HealthSummary = ({ data }) => {
  const { passing, warning, critical } = getCounters(data);

  return (
    <div className="tn-health-container flex flex-row">
      <div className="tn-health-passing w-1/3 px-8 bg-green-200 border-green-600 border-l-4 text-green-600 shadow rounded-lg my-2 mr-4">
        <div className="flex items-center rounded justify-between p-3 text-2xl">
          <span className="rounded-lg p-2">
            <EOS_CHECK_CIRCLE_OUTLINED size={25} className="fill-green-600" />
          </span>
          <div className="flex w-full ml-2 items-center justify-between">
            <p>Passing</p>
            <p className="font-semibold">{passing}</p>
          </div>
        </div>
      </div>
      <div className="tn-health-warning w-1/3 px-8 bg-yellow-200 border-yellow-600 border-l-4 text-yellow-600 shadow rounded-lg my-2">
        <div className="flex items-center rounded justify-between p-3 text-2xl">
          <span className="rounded-lg p-2">
            <EOS_WARNING_OUTLINED size={25} className="fill-yellow-600" />
          </span>
          <div className="flex w-full ml-2 items-center justify-between">
            <p>Warning</p>
            <p className="font-semibold">{warning}</p>
          </div>
        </div>
      </div>
      <div className="tn-health-critical w-1/3 px-8 bg-red-200 border-red-600 border-l-4 text-red-600 shadow rounded-lg my-2 ml-4">
        <div className="flex items-center rounded justify-between p-3 text-2xl">
          <span className="rounded-lg p-2">
            <EOS_ERROR_OUTLINED size={25} className="fill-red-600" />
          </span>
          <div className="flex w-full ml-2 items-center justify-between">
            <p>Critical</p>
            <p className="font-semibold">{critical}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthSummary;
