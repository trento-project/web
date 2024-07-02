import React from 'react';

import { EOS_CLEANING_SERVICES } from 'eos-icons-react';
import classNames from 'classnames';

import Button from '@common/Button';
import Spinner from '@common/Spinner';
import DisabledGuard from '@common/DisabledGuard';

function CleanUpButton({
  className,
  size = 'small',
  type = 'primary-white',
  cleaning,
  userAbilities,
  permittedFor,
  onClick,
}) {
  const buttonClasses = classNames(
    'inline-block mx-0.5 border-green-500 border w-fit',
    className
  );

  return (
    <DisabledGuard userAbilities={userAbilities} permitted={permittedFor}>
      <Button
        type={type}
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
    </DisabledGuard>
  );
}

export default CleanUpButton;
