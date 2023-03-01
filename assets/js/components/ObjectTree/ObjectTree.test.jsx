import React from 'react';

import { screen, fireEvent, render } from '@testing-library/react';
import { objectTreeFactory } from '@lib/test-utils/factories';
import '@testing-library/jest-dom';

import ObjectTree from '.';
import { flattenTree, treeify } from './tree';

describe('ObjectTree component', () => {
  it('should render correctly', () => {
    const data = objectTreeFactory.build();
    const {
      number,
      string,
      complexObject: { nestedString },
    } = data;

    render(<ObjectTree data={data} />);

    expect(screen.getByText(number)).toBeVisible();
    expect(screen.getByText(string)).toBeVisible();
    expect(screen.queryByText(nestedString)).toBeNull();

    fireEvent.click(screen.getByText('complexObject'));

    expect(screen.queryByText(nestedString)).toBeVisible();
  });
});

describe('flattenTree and treeify', () => {
  it('should flatten an object tree', () => {
    const data = objectTreeFactory.build();

    const { count, children } = flattenTree(treeify(data), null);

    expect(count).toBe(children.length - 1);

    const [
      {
        children: [firstChildId, _second, _third, fourthChildId],
      },
    ] = children;

    expect(children[0].id).toBe(0);
    expect(children[0].parent).toBeNull();

    expect(children[firstChildId].parent).toBe(0);
    expect(children[fourthChildId].parent).toBe(0);
    expect(children[fourthChildId].id).toBe(fourthChildId);

    const {
      [fourthChildId]: {
        children: [firstComplexObjectChild, secondComplexObjectChild],
      },
    } = children;

    expect(children[firstComplexObjectChild].parent).toBe(fourthChildId);
    expect(children[secondComplexObjectChild].parent).toBe(fourthChildId);
  });
});
