import React from 'react';
import classNames from 'classnames';

const Pill = ({ className, children, onClick = () => {} }) => (
  <span
    className={classNames(
      'px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
      {
        'bg-green-100': !Boolean(className),
        'text-green-800': !Boolean(className),
      },
      className
    )}
    onClick={onClick}
  >
    {children}
  </span>
);

export default Pill;
