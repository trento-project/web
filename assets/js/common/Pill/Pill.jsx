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
  display = 'inline-flex',
  disabled,
}) {
  return (
    <span
      className={classNames(
        `leading-5 font-semibold`,
        {
          'bg-green-100': !className,
          'text-green-800': !className,
        },
        { 'opacity-50 pointer-events-none': disabled },
        roundedMode,
        sizeClasses[size],
        display,
        className
      )}
      aria-hidden="true"
      onClick={(e) => {
        if (disabled) return;
        onClick(e);
      }}
    >
      {children}
    </span>
  );
}

export default Pill;
