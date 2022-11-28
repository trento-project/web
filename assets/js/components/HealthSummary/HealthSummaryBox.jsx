import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';
import classNames from 'classnames';
import React from 'react';

const iconByHealth = {
  passing: () => (
    <EOS_CHECK_CIRCLE_OUTLINED
      size={40}
      className="fill-green-600"
      style={{ opacity: 1 }}
    />
  ),
  warning: () => (
    <EOS_WARNING_OUTLINED
      size={40}
      className="fill-yellow-400"
      style={{ opacity: 1 }}
    />
  ),
  critical: () => (
    <EOS_ERROR_OUTLINED
      size={40}
      className="fill-red-600"
      style={{ opacity: 1 }}
    />
  ),
};

const styleByHealth = {
  passing: (selected, asButton) => classNames(
    'tn-health-passing w-1/3 px-5 shadow rounded-lg my-2 mr-10 bg-white',
    {
      'bg-jungle-green-500 border-green-600 text-white hover:opacity-75':
          selected,
      'text-jungle-green-500': !selected,
      'hover:opacity-75': asButton && !selected,
    },
  ),
  warning: (selected, asButton) => classNames(
    'tn-health-warning w-1/3 px-5 shadow rounded-lg my-2 mr-10 bg-white',
    {
      'bg-yellow-400 border-yellow-400 text-white hover:opacity-75': selected,
      'text-yellow-400': !selected,
      'hover:opacity-75': asButton && !selected,
    },
  ),
  critical: (selected, asButton) => classNames(
    'tn-health-critical w-1/3 px-5 shadow rounded-lg my-2 mr-10 bg-white',
    {
      'bg-red-600 border-red-600 text-white hover:opacity-75': selected,
      'text-red-600': !selected,
      'hover:opacity-75': asButton && !selected,
    },
  ),
};

const labelByHealth = {
  passing: 'Passing',
  warning: 'Warning',
  critical: 'Critical',
};

const defaultOnClick = () => {};

function HealthSummaryBox({
  health,
  selected,
  value = 0,
  style,
  onClick = defaultOnClick,
}) {
  const asButton = onClick !== defaultOnClick;

  return (
    <div
      style={style}
      data-testid={`health-box-${health}-${
        selected ? 'selected' : 'not-selected'
      }`}
      className={styleByHealth[health](selected, asButton)}
      role={!asButton ? null : 'button'}
      onClick={() => onClick(health)}
    >
      <div className="flex rounded justify-between p-4 text-2xl font-semibold">
        <span className="rounded-lg p-1 mr-2 bg-white">
          {iconByHealth[health]()}
        </span>
        <div className="flex w-full ml-2 items-center justify-between">
          <p>{labelByHealth[health]}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default HealthSummaryBox;
