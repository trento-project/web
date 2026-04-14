import React from 'react';

import Button from '@common/Button';
import Tooltip from '@common/Tooltip';

function TooltipIconButton({
  children,
  tooltip,
  side = 'bottom',
  className,
  ...rest
}) {
  return (
    <Tooltip content={tooltip} place={side}>
      <Button className={className || ''} type="transparent" {...rest}>
        {children}
      </Button>
    </Tooltip>
  );
}

export default TooltipIconButton;
