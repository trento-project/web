"use client";

import React from "react";
import Button from '@common/Button';
// import Tooltip from './Tooltip';
import Tooltip from '@common/Tooltip';
import { forwardRef } from "react";

export const TooltipIconButton = forwardRef(({ children, tooltip, side = "bottom", className, ...rest }, ref) => {
  return (
    <Tooltip
      content={tooltip}
      place={side}
      wrap={false}
    >
      <Button
        type="transparent"
        {...rest}
        className={className || ""}
        ref={ref}
      >
        {children}
      </Button>
    </Tooltip>
  );
});

TooltipIconButton.displayName = "TooltipIconButton";
