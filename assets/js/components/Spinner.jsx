import React from 'react';
import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

function Spinner({
  centered = false,
  wrapperClassName = '',
  size = 'm',
  spinnerColor = 'fill-jungle-green-500',
}) {
  return (
    <div role="alert" aria-label="Loading" className={wrapperClassName}>
      <EOS_LOADING_ANIMATED
        size={size}
        centered={centered}
        className={spinnerColor}
      />
    </div>
  );
}

export default Spinner;
