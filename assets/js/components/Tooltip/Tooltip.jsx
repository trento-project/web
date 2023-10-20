import React from 'react';
import RcTooltip from 'rc-tooltip';
import classNames from 'classnames';

export const PLACES = [
  'top',
  'left',
  'right',
  'bottom',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'leftTop',
  'leftBottom',
  'rightTop',
  'rightBottom',
];

const getPlacement = (place) => (PLACES.includes(place) ? place : 'top');

function Tooltip({
  className,
  content,
  children,
  childrenClassName = 'inline-flex',
  place = 'top',
  isEnabled = true,
  ...rest
}) {
  if (!isEnabled) {
    return children;
  }
  const overlayClasses = classNames(
    'leading-5 text-xs font-semibold bg-black text-white flex items-center px-4 py-2 rounded',
    className
  );
  return (
    <RcTooltip
      motion={{ motionName: 'rc-tooltip-fade' }}
      overlay={<span className={overlayClasses}>{content}</span>}
      placement={getPlacement(place)}
      {...rest}
    >
      <span className={childrenClassName}>{children}</span>
    </RcTooltip>
  );
}

export default Tooltip;
