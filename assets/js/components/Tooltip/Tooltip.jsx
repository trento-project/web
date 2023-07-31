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

export function TooltipNext({
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
    <div className="flex tooltip-container">
      <div className={`flex ${anchorReference}`}>{children}</div>
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
          // opacity: 1,
          visibility: 'visible',
        }}
        opacity={1}
        // isOpen
        disableStyleInjection
        {...rest}
      />
    </div>
  );
}

function Tooltip({ children, tooltipText, width = '' }) {
  const tipRef = React.createRef(null);

  const handleMouseEnter = () => {
    tipRef.current.style.opacity = 1;
    tipRef.current.style.marginTop = '10px';
    tipRef.current.style['z-index'] = '10';
  };

  const handleMouseLeave = () => {
    tipRef.current.style.opacity = 0;
    tipRef.current.style.marginTop = '5px';
    tipRef.current.style['z-index'] = '-10';
  };

  return (
    <>
      <div
        className="w-full h-full absolute inset-0 flex justify-center items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      <div
        className={classNames(
          width,
          'absolute whitespace-no-wrap bg-black text-white px-4 py-2 rounded flex items-center transition-all duration-150'
        )}
        style={{ top: '100%', opacity: 0 }}
        ref={tipRef}
      >
        <div
          className="bg-black h-3 w-3 absolute"
          style={{ top: '-6px', right: '50%', transform: 'rotate(45deg)' }}
        />
        {tooltipText}
      </div>
    </>
  );
}

export default Tooltip;
