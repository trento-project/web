import React from 'react';
import classNames from 'classnames';

import Pill from '@common/Pill';

function ModifiedCheckPill({
  className,
  content = 'MODIFIED',
  customized = false,
}) {
  if (!customized) return null;
  return (
    <Pill
      className={classNames(
        'bg-white text-jungle-green-500 border border-jungle-green-500',
        className
      )}
      size="xs"
    >
      {content}
    </Pill>
  );
}

export default ModifiedCheckPill;
