import React from 'react';
import classNames from 'classnames';

const getSizeClasses = (size) => {
  switch (size) {
    case 'small':
      return 'py-1 px-2 text-sm';
    default:
      return 'py-2 px-4 text-base';
  }
};

const getButtonClasses = (type) => {
  switch (type) {
    case 'secondary':
      return 'bg-jungle-green-500 hover:bg-jungle-green-500 focus:ring-jungle-green-500 focus:ring-offset-white text-white w-full transition ease-in duration-200 text-center font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg';
    default:
      return 'bg-persimmon hover:bg-persimmon focus:ring-persimmon focus:ring-offset-white text-gray-800 w-full transition ease-in duration-200 text-center font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg';
  }
};

const Button = ({ children, className, type, size, ...props }) => {
  const buttonClasses = classNames(
    getButtonClasses(type),
    getSizeClasses(size),
    className
  );
  return (
    <button type="button" className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
