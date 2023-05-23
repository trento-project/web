/* eslint-disable react/no-array-index-key */

import React, { useState, useEffect } from 'react';

import {
  EOS_KEYBOARD_ARROW_LEFT_FILLED,
  EOS_KEYBOARD_ARROW_RIGHT_FILLED,
  EOS_LENS_FILLED,
} from 'eos-icons-react';

import classNames from 'classnames';

import Arrow from './Arrow';

function DottedPagination({
  pages = [],
  initialSelectedIndex = 0,
  onChange = () => {},
}) {
  const pagesLength = pages.length;
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);

  useEffect(() => {
    const newIndex =
      selectedIndex >= pagesLength
        ? Math.max(pagesLength - 1, 0)
        : selectedIndex;
    setSelectedIndex(newIndex);
    onChange(pages[newIndex]);
  }, [pages]);

  return (
    <div className="flex items-center">
      <Arrow
        onClick={() => {
          const newIndex = selectedIndex > 0 ? selectedIndex - 1 : 0;
          setSelectedIndex(newIndex);
          onChange(pages[newIndex]);
        }}
      >
        <EOS_KEYBOARD_ARROW_LEFT_FILLED
          className="fill-gray-300 hover:fill-gray-400"
          size="l"
        />
      </Arrow>
      {Array(pagesLength)
        .fill()
        .map((_, pageIndex) => (
          <EOS_LENS_FILLED
            key={pageIndex}
            className={classNames({
              'fill-jungle-green-500': pageIndex === selectedIndex,
              'fill-gray-300': pageIndex !== selectedIndex,
              'mr-2': pageIndex !== pagesLength - 1,
            })}
            size="s"
          />
        ))}
      <Arrow
        onClick={() => {
          const newIndex =
            selectedIndex < pagesLength - 1
              ? selectedIndex + 1
              : pagesLength - 1;
          setSelectedIndex(newIndex);
          onChange(pages[newIndex]);
        }}
      >
        <EOS_KEYBOARD_ARROW_RIGHT_FILLED
          className="fill-gray-300 hover:fill-gray-400"
          size="l"
        />
      </Arrow>
    </div>
  );
}

export default DottedPagination;
