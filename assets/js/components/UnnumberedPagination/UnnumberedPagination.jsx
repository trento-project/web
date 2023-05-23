/* eslint-disable react/no-array-index-key */

import React, { useState, useEffect } from 'react';

import {
  EOS_KEYBOARD_ARROW_LEFT_FILLED,
  EOS_KEYBOARD_ARROW_RIGHT_FILLED,
  EOS_LENS_FILLED,
} from 'eos-icons-react';

import classNames from 'classnames';

function Arrow({ children, onClick }) {
  return (
    <div
      aria-hidden="true"
      role="button"
      className="cursor-pointer"
      onClick={() => onClick()}
    >
      {children}
    </div>
  );
}

function UnnumberedPagination({
  pages = [],
  initialSelectedIndex = 0,
  onChange = () => {},
}) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);

  useEffect(() => {
    const newIndex =
      selectedIndex >= pages.length ? pages.length - 1 : selectedIndex;
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
        <EOS_KEYBOARD_ARROW_LEFT_FILLED className="fill-gray-500" size="l" />
      </Arrow>
      {Array(pages.length)
        .fill()
        .map((_, pageIndex) => (
          <EOS_LENS_FILLED
            key={pageIndex}
            className={classNames({
              'fill-jungle-green-500': pageIndex === selectedIndex,
              'fill-gray-500': pageIndex !== selectedIndex,
              'mr-2': pageIndex !== pages.length - 1,
            })}
            size="s"
          />
        ))}
      <Arrow
        onClick={() => {
          const newIndex =
            selectedIndex < pages.length - 1
              ? selectedIndex + 1
              : pages.length - 1;
          setSelectedIndex(newIndex);
          onChange(pages[newIndex]);
        }}
      >
        <EOS_KEYBOARD_ARROW_RIGHT_FILLED className="fill-gray-500" size="l" />
      </Arrow>
    </div>
  );
}

export default UnnumberedPagination;
