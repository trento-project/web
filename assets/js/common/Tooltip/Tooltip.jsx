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
  place = 'top',
  isEnabled = true,
  // be careful using wrap={false}. The children element must receive the `ref` property.
  // Check Button component
  // Otherwise findDom deprecated warning is raised
  wrap = true,
  // The visible ternary flag forces the tooltip to show/hide
  // regardless of the user interaction.
  //  true -> tooltip is always visible
  //  false -> tooltip is never visible
  //  undefined -> tooltip is visible when the user triggers the action (e.g. hover)
  visible,
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
      visible={visible}
      {...rest}
    >
      {wrap ? <span>{children}</span> : children}
    </RcTooltip>
  );
}

export default Tooltip;
