import React from 'react';
import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

function Spinner({ className = '', size = 'm' }) {
  return (
    <div role="alert" aria-label="Loading" className={className}>
      <EOS_LOADING_ANIMATED size={size} className="fill-jungle-green-500" />
    </div>
  );
}

export default Spinner;
