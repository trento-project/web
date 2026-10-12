// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import TreeView from 'react-accessible-treeview';

import ObjectTreeNode from './ObjectTreeNode';
import { getTreeRepresentation } from './tree';

function ObjectTree({ className, data }) {
  const treeRepresentation = getTreeRepresentation(data);

  return (
    <TreeView
      className={className}
      data={treeRepresentation}
      aria-label="property tree"
      nodeRenderer={ObjectTreeNode}
    />
  );
}

export default ObjectTree;
