import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import classNames from 'classnames';

export const PLACES = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
];

const getPlacement = (place) => (PLACES.includes(place) ? place : 'top');

function Tooltip({
  className,
  content,
  children,
  offset = 10,
  place = 'top',
  isEnabled = true,
  ...rest
}) {
  const anchorReference = `tooltip-anchor-${Date.now()}`;
  return (
    <span className="flex tooltip-container">
      <span className={`flex ${anchorReference}`}>{children}</span>
      <ReactTooltip
        hidden={!isEnabled}
        className={classNames(
          'leading-5 text-xs font-semibold whitespace-no-wrap bg-black text-white px-4 py-2 rounded flex items-center transition-all duration-150',
          className
        )}
        offset={offset}
        classNameArrow="tooltip-arrow"
        anchorSelect={`.${anchorReference}`}
        content={content}
        place={getPlacement(place)}
        style={{
          zIndex: 10,
          visibility: 'visible',
        }}
        opacity={1}
        disableStyleInjection
        {...rest}
      />
    </span>
  );
}

export default Tooltip;
