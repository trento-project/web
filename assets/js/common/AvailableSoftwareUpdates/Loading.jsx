import React from 'react';
import classNames from 'classnames';
import Spinner from '@common/Spinner';

function Loading({ className }) {
  return (
    <div className={classNames(className, 'w-full', 'my-4')}>
      <p className="font-bold text-2xl">Available Software Updates</p>
      <Spinner size="xl" />
    </div>
  );
}

export default Loading;
