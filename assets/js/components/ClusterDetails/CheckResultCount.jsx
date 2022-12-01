import React from 'react';

import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';

const uiForResult = {
  passing: {
    iconColorClassName: 'fill-green-600',
    backgroundColorClassName: 'bg-green-200',
    component: EOS_CHECK_CIRCLE_OUTLINED,
    text: 'Passing',
  },
  warning: {
    iconColorClassName: 'fill-yellow-600',
    backgroundColorClassName: 'bg-yellow-200',
    component: EOS_WARNING_OUTLINED,
    text: 'Warning',
  },
  critical: {
    iconColorClassName: 'fill-red-600',
    backgroundColorClassName: 'bg-red-200',
    component: EOS_ERROR_OUTLINED,
    text: 'Critical',
  },
};

const CheckResultCount = ({ value, result, onClick }) => {
  const {
    iconColorClassName,
    backgroundColorClassName,
    component: Component,
    text,
  } = uiForResult[result];

  return (
    <div
      role="button"
      onClick={onClick}
      className="hover:text-jungle-green-500 flex items-center rounded p-3 text-lg font-bold"
    >
      <span className={`rounded-lg p-2 ${backgroundColorClassName} mr-2`}>
        <Component size={25} className={`${iconColorClassName}`} />
      </span>
      <div className="flex w-full ml-2 items-center w-[65%]">
        <p>{text}</p>
      </div>
      <div className="flex text-2xl">{value}</div>
    </div>
  );
};

export default CheckResultCount;
