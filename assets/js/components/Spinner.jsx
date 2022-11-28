import React from 'react';
import { computedIconCssClass } from '@lib/icon';

import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

function Spinner({ centered = false }) {
  return (
    <div role="alert" aria-label="Loading">
      <EOS_LOADING_ANIMATED
        className={computedIconCssClass('fill-jungle-green-500', centered)}
      />
    </div>
  );
}

export default Spinner;
