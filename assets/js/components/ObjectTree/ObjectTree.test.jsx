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
      array: { 0: firstArrayElement },
      complexObject: { nestedString },
    } = data;

    render(<ObjectTree data={data} />);

    expect(screen.getByText(number)).toBeVisible();
    expect(screen.getByText(string)).toBeVisible();
    expect(screen.queryByText(nestedString)).toBeNull();
    expect(screen.queryByText(firstArrayElement)).toBeNull();

    fireEvent.click(screen.getByText('complexObject'));
    fireEvent.click(screen.getByText('array'));

    expect(screen.queryByText(nestedString)).toBeVisible();
    expect(screen.queryByText(firstArrayElement)).toBeVisible();
  });
});

describe('flattenTree and treeify', () => {
  it('should flatten an object tree', () => {
    const data = objectTreeFactory.build();

    const { count, children } = flattenTree(treeify('object', data), null);

    expect(count).toBe(children.length - 1);

    const [
      {
        children: [firstChildID, _second, _third, fourthChildID],
      },
    ] = children;

    expect(children[0].id).toBe(0);
    expect(children[0].parent).toBeNull();

    expect(children[firstChildID].parent).toBe(0);
    expect(children[fourthChildID].parent).toBe(0);
    expect(children[fourthChildID].id).toBe(fourthChildID);

    const {
      [fourthChildID]: {
        children: [firstComplexObjectChild, secondComplexObjectChild],
      },
    } = children;

    expect(children[firstComplexObjectChild].parent).toBe(fourthChildID);
    expect(children[secondComplexObjectChild].parent).toBe(fourthChildID);
  });
});
