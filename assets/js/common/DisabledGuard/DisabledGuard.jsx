import React from 'react';

import Tooltip from '@common/Tooltip';

const ALL_PERMITTED = ['all:all'];

const DEFAULT_TOOLTIP_MESSAGE = 'You are not authorized for this action';

// DisabledGuard adds the `disabled` prop to the guarded element.
// The children element must be of one element.
// If the coming children is wrapped with a tooltip, the authorization tooltip
// supersedes the original tooltip in case of unauthorized access.

function DisabledGuard({
  userAbilities,
  permitted,
  withTooltip = true,
  tooltipMessage = DEFAULT_TOOLTIP_MESSAGE,
  tooltipPlace = 'bottom',
  children,
}) {
  const permittedFor = ALL_PERMITTED.concat(permitted);

  const isPermitted = userAbilities
    .map(({ name, resource }) => `${name}:${resource}`)
    .some((ability) => permittedFor.includes(ability));

  if (isPermitted) {
    return children;
  }

  const guardedElement =
    children.type === Tooltip ? children.props.children : children;

  const disabledElement = React.cloneElement(guardedElement, {
    disabled: true,
  });

  return (
    <Tooltip
      isEnabled={withTooltip}
      content={tooltipMessage}
      place={tooltipPlace}
      wrap={false}
    >
      {disabledElement}
    </Tooltip>
  );
}

export default DisabledGuard;
