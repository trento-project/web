import React from 'react';
import classNames from 'classnames';

const sizeClasses = {
  xs: 'px-2 text-xs',
  sm: 'px-2 py-1 text-sm',
};

function Pill({
  className,
  children,
  onClick = () => {},
  size = 'sm',
  roundedMode = 'rounded-full',
}) {
  return (
    <span
      className={classNames(
        `inline-flex leading-5 font-semibold`,
        {
          'bg-green-100': !className,
          'text-green-800': !className,
        },
        roundedMode,
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
      onClick={onClick}
    >
      {children}
    </span>
  );
}

export default Pill;
