import React from 'react';
import classNames from 'classnames';

import { has } from 'lodash';

import ObjectTreeIcon from './ObjectTreeIcon';

const renderElement = (element) => {
  if (element.value === null) {
    return 'null';
  }

  if (!has(element, 'value') && element.children.length === 0) {
    return '{}';
  }

  return element.value;
};

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
        <span className="ml-2">{renderElement(element)}</span>
      )}
    </div>
  );
}

export default ObjectTreeNode;
