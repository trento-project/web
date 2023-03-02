export const flattenTree = (tree, parent, id = 0) => {
  const { count, children } =
    tree.children == null || tree.children.length === 0
      ? { count: id, children: [] }
      : tree.children.reduce(
          (
            { count: accumulatedCount, children: accumulatedChildren },
            currentChild
          ) => {
            const { count: newCount, children: newChildren } = flattenTree(
              currentChild,
              id,
              accumulatedCount + 1
            );
            return {
              count: newCount,
              children: [...accumulatedChildren, ...newChildren],
            };
          },
          {
            count: id,
            children: [],
          }
        );

  const childrenIds = [
    ...children
      .filter(({ parent: parentId }) => parentId === id)
      .map(({ id: nodeId }) => nodeId),
  ];

  const node = {
    ...tree,
    id,
    name: tree.name,
    children: childrenIds,
    parent,
  };

  return { count, children: [node, ...children] };
};

export const treeify = (name, data) => ({
  name,
  children: Object.keys(data).map((key) => {
    const { [key]: element } = data;
    const dataType = typeof element;

    if (dataType === 'object') {
      return treeify(key, element);
    }

    return { name: key, value: element };
  }),
});

export const getTreeRepresentation = (data) => {
  const tree = treeify('object', data);
  const { children: flattenedTree } = flattenTree(tree, null, 0);
  return flattenedTree;
};
