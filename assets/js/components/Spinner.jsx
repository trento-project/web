import React from 'react';
import { computedIconCssClass } from '@lib/icon';

import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

const Spinner = ({ centered = false }) => {
  return (
    <EOS_LOADING_ANIMATED
      className={computedIconCssClass('fill-jungle-green-500', centered)}
    />
  );
};

export default Spinner;
