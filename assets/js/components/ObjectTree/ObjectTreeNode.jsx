import React from 'react';
import classNames from 'classnames';

import ObjectTreeIcon from './ObjectTreeIcon';

function ObjectTreeNode({
  element,
  isBranch,
  isExpanded,
  getNodeProps,
  level,
}) {
  const nodeProps = getNodeProps();
  const nodeClassName = classNames(nodeProps.className, 'flex');

  return (
    <div
      {...nodeProps}
      className={nodeClassName}
      style={{ paddingLeft: 20 * (level - 1) }}
    >
      <span className="font-bold">{element.name}</span>

      {isBranch ? (
        <ObjectTreeIcon expanded={isExpanded} />
      ) : (
        <span className="ml-2">{element.value}</span>
      )}
    </div>
  );
}

export default ObjectTreeNode;
