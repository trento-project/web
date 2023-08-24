import React from 'react';

import { EOS_CLEANING_SERVICES } from 'eos-icons-react';
import classNames from 'classnames';

import Button from '@components/Button';
import Spinner from '@components/Spinner';

function CleanUpButton({ className, size = 'small', cleaning, onClick }) {
  const buttonClasses = classNames(
    'inline-block mx-0.5 border-green-500 border w-fit',
    className
  );

  return (
    <Button
      type="primary-white"
      className={buttonClasses}
      size={size}
      disabled={cleaning}
      onClick={() => onClick()}
    >
      {cleaning === true ? (
        <Spinner className="justify-center flex" />
      ) : (
        <>
          <EOS_CLEANING_SERVICES
            size="base"
            className="fill-jungle-green-500 inline"
          />
          <span className="text-jungle-green-500 text-sm font-bold pl-1.5">
            Clean up
          </span>
        </>
      )}
    </Button>
  );
}

export default CleanUpButton;
