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
  children,
}) {
  const permittedFor = ALL_PERMITTED.concat(permitted);

  const isPermitted = userAbilities
    .map(({ name, resource }) => `${name}:${resource}`)
    .some((ability) => permittedFor.includes(ability));

  if (!isPermitted) {
    const element =
      children.type === Tooltip
        ? React.cloneElement(children.props.children, { disabled: true })
        : React.cloneElement(children, { disabled: true });

    return (
      <Tooltip
        isEnabled={withTooltip}
        content={tooltipMessage}
        place="bottom"
        wrap={false}
      >
        <div>{element}</div>
      </Tooltip>
    );
  }

  return children;
}

export default DisabledGuard;
