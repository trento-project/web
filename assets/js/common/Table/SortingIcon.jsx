import React from 'react';
import { EOS_ARROW_UPWARD, EOS_ARROW_DOWNWARD } from 'eos-icons-react';

const styles = 'inline-table relative top-1';

export default function SortingIcon({
  sortable = false,
  sortDirection = undefined,
}) {
  if (!sortable) return null;

  if (sortDirection === 'asc')
    return (
      <span className={styles}>
        <EOS_ARROW_UPWARD />
      </span>
    );

  if (sortDirection === 'desc')
    return (
      <span className={styles}>
        <EOS_ARROW_DOWNWARD />
      </span>
    );

  return (
    <span className={`invisible ${styles}`}>
      <EOS_ARROW_UPWARD />
    </span>
  );
}
