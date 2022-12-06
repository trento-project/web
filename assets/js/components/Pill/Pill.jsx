import React from 'react';
import classNames from 'classnames';

function Pill({
  className,
  children,
  onClick = () => {},
  roundedMode = 'rounded-full',
}) {
  return (
    <span
      className={classNames(
        `px-2 py-1 inline-flex text-sm leading-5 font-semibold ${roundedMode}`,
        {
          'bg-green-100': !className,
          'text-green-800': !className,
        },
        className,
      )}
      aria-hidden="true"
      onClick={onClick}
    >
      {children}
    </span>
  );
}

export default Pill;
