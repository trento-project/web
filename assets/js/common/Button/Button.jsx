import React from 'react';
import classNames from 'classnames';

const getSizeClasses = (size) => {
  switch (size) {
    case 'small':
      return 'py-1 px-2 text-sm';
    case 'fit':
      return 'text-sm';
    default:
      return 'py-2 px-4 text-base';
  }
};

const getButtonClasses = (type) => {
  switch (type) {
    case 'primary-white':
      return 'bg-white hover:opacity-75 focus:outline-none text-jungle-green-500 border border-jungle-green-500 w-full transition ease-in duration-200 text-center font-semibold rounded shadow';
    case 'primary-white-fit':
      return 'bg-white hover:opacity-75 focus:outline-none text-jungle-green-500 border border-jungle-green-500 w-fit transition ease-in duration-200 text-center font-semibold rounded shadow';
    case 'transparent':
      return 'bg-transparent hover:opacity-75 focus:outline-none w-full transition ease-in duration-200 font-semibold';
    case 'secondary':
      return 'bg-persimmon hover:opacity-75 focus:outline-none text-gray-800 w-full transition ease-in duration-200 text-center font-semibold rounded shadow';
    case 'default-fit':
      return 'bg-jungle-green-500 hover:opacity-75 focus:outline-none text-white border border-jungle-green-500 w-fit transition ease-in duration-200 text-center font-semibold rounded shadow';
    case 'danger':
      return 'bg-white hover:opacity-75 focus:outline-none text-red-500 border border-red-500 transition ease-in duration-200 text-center font-semibold rounded shadow';
    case 'danger-bold':
      return 'bg-red-500 hover:opacity-75 focus:outline-none text-white border border-red-500 transition ease-in duration-200 text-center font-semibold rounded shadow';
    case 'link':
      return 'cursor-pointer text-jungle-green-500 hover:text-jungle-green-300';
    default:
      return 'bg-jungle-green-500 hover:opacity-75 focus:outline-none text-white w-full transition ease-in duration-200 text-center font-semibold rounded shadow disabled:bg-gray-400 disabled:text-gray-200';
  }
};

function Button({
  children,
  className,
  type,
  size,
  disabled,
  asSubmit,
  ...props
}) {
  const buttonClasses = classNames(
    getButtonClasses(type),
    getSizeClasses(size),
    { 'opacity-50': disabled },
    className
  );

  return (
    <button
      type={asSubmit ? 'submit' : 'button'}
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
