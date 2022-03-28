import React from 'react';
import classNames from 'classnames';

const Pill = ({
  className,
  children,
  onClick = () => {},
  roundedMode = 'rounded-full',
}) => (
  <span
    className={classNames(
      `px-2 py-1 inline-flex text-sm leading-5 font-semibold ${roundedMode}`,
      {
        'bg-green-100': !className,
        'text-green-800': !className,
      },
      className
    )}
    onClick={onClick}
  >
    {children}
  </span>
);

export default Pill;
