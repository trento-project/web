import React from 'react';
import classNames from 'classnames';

function ApiKeyBox({ apiKey, className }) {
  return (
    <div
      className={classNames(
        'w-full break-words p-2 pr-2 rounded-lg bg-white border-gray-300 border',
        className
      )}
    >
      <code
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxWidth: '650px',
          display: 'block',
        }}
      >
        {apiKey}
      </code>
    </div>
  );
}

export default ApiKeyBox;
